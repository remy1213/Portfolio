import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execPromise = promisify(exec);
const ADMIN_PASSWORD = "remy";

async function probe(file: string) {
  const { stdout } = await execPromise(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -show_entries format=duration -of json "${file}"`,
    { timeout: 30_000 }
  );
  const data = JSON.parse(stdout);
  const stream = data.streams?.[0] || {};
  const [num, den] = String(stream.r_frame_rate || '30/1').split('/').map(Number);
  return {
    width: stream.width || 0,
    height: stream.height || 0,
    fps: den ? num / den : 30,
    duration: parseFloat(data.format?.duration) || 0,
  };
}

/**
 * Re-encodes a photo or video in place at web-friendly quality/size.
 * Same path in = same path out, so nothing on the site needs re-linking.
 */
export async function POST(req: Request) {
  const host = req.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { password, file, resolution = '720', dropAudio = true } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }
    if (!file || typeof file !== 'string') {
      return NextResponse.json({ ok: false, error: 'No file given' }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), 'public');
    const inputPath = path.resolve(path.join(publicDir, file));
    if (!inputPath.startsWith(publicDir)) {
      return NextResponse.json({ ok: false, error: 'File must live inside public/' }, { status: 403 });
    }
    const before = (await fs.stat(inputPath).catch(() => null))?.size;
    if (!before) {
      return NextResponse.json({ ok: false, error: `File not found: public${file}` }, { status: 404 });
    }

    const isVideo = /\.(mp4|webm|mov)$/i.test(file);
    const ext = path.extname(inputPath);
    const tmpPath = inputPath.replace(new RegExp(`\\${ext}$`), `.optimizing${isVideo ? '.mp4' : ext}`);

    if (isVideo) {
      const info = await probe(inputPath);
      // Target applies to the SHORTER side, so landscape and vertical both work.
      const target = resolution === '1080' ? 1080 : 720;
      const shortSide = Math.min(info.width, info.height) || target;
      const scale = shortSide > target ? target / shortSide : 1;
      const even = (n: number) => Math.max(2, Math.round((n * scale) / 2) * 2);
      const scaleArg = scale < 1 ? `-vf "scale=${even(info.width)}:${even(info.height)}"` : '';
      const fpsArg = info.fps > 30.5 ? '-r 30' : '';
      const audioArg = dropAudio ? '-an' : '-c:a aac -b:a 128k';

      const cmd = `ffmpeg -y -i "${inputPath}" ${scaleArg} ${fpsArg} ${audioArg} -c:v libx264 -pix_fmt yuv420p -crf 26 -preset medium -movflags +faststart "${tmpPath}"`;
      await execPromise(cmd, { timeout: 10 * 60 * 1000 });

      // Validate: roughly the same duration and actually smaller.
      const outInfo = await probe(tmpPath).catch(() => null);
      const after = (await fs.stat(tmpPath).catch(() => null))?.size || 0;
      if (!outInfo || Math.abs(outInfo.duration - info.duration) > 1.5 || after < 1000) {
        await fs.unlink(tmpPath).catch(() => {});
        return NextResponse.json({ ok: false, error: 'Optimized version came out broken — original left untouched.' }, { status: 422 });
      }
      if (after >= before) {
        await fs.unlink(tmpPath).catch(() => {});
        return NextResponse.json({ ok: true, skipped: true, before, after: before, message: 'Already as small as it gets — left unchanged.' });
      }
      await fs.unlink(inputPath);
      await fs.rename(tmpPath, inputPath);
      return NextResponse.json({ ok: true, before, after });
    }

    // Images: downscale to max 2000px wide, re-encode in the same format.
    await execPromise(
      `ffmpeg -y -i "${inputPath}" -vf "scale='min(2000,iw)':-2" ${/\.(jpg|jpeg)$/i.test(ext) ? '-q:v 4' : ''} "${tmpPath}"`,
      { timeout: 2 * 60 * 1000 }
    );
    const after = (await fs.stat(tmpPath).catch(() => null))?.size || 0;
    if (after < 1000) {
      await fs.unlink(tmpPath).catch(() => {});
      return NextResponse.json({ ok: false, error: 'Optimized version came out broken — original left untouched.' }, { status: 422 });
    }
    if (after >= before) {
      await fs.unlink(tmpPath).catch(() => {});
      return NextResponse.json({ ok: true, skipped: true, before, after: before, message: 'Already as small as it gets — left unchanged.' });
    }
    await fs.unlink(inputPath);
    await fs.rename(tmpPath, inputPath);
    return NextResponse.json({ ok: true, before, after });
  } catch (err: any) {
    console.error('[API Optimize Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Optimize failed' }, { status: 500 });
  }
}
