import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execPromise = promisify(exec);
const ADMIN_PASSWORD = "remy";

/**
 * Cuts a magnified detail crop out of an image already in /public and saves
 * it as <name>-zoom.jpg next to it. Used by the admin's "auto-generate"
 * buttons for the showcase lens and gallery detail crops.
 */
export async function POST(req: Request) {
  const host = req.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. This editor can only run locally.' }, { status: 403 });
  }

  try {
    const { password, image, focusX = 50, focusY = 50, zoom = 3 } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ ok: false, error: 'No image path given' }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), 'public');
    const inputPath = path.resolve(path.join(publicDir, image));
    if (!inputPath.startsWith(publicDir)) {
      return NextResponse.json({ ok: false, error: 'Image must live inside public/' }, { status: 403 });
    }
    try {
      await fs.access(inputPath);
    } catch {
      return NextResponse.json({ ok: false, error: `Image not found on disk at public${image}` }, { status: 404 });
    }

    const z = Math.min(6, Math.max(1.5, Number(zoom) || 3));
    const fx = Math.min(100, Math.max(0, Number(focusX) || 50)) / 100;
    const fy = Math.min(100, Math.max(0, Number(focusY) || 50)) / 100;

    const outputPath = inputPath.replace(/\.[^.]+$/, '') + '-zoom.jpg';
    const outputPublic = image.replace(/\.[^.]+$/, '') + '-zoom.jpg';

    // Crop a 1/zoom-sized window centred on the focal point, then cap width.
    const vf = `crop=iw/${z}:ih/${z}:(iw-iw/${z})*${fx}:(ih-ih/${z})*${fy},scale='min(1800,iw)':-2`;
    await execPromise(`ffmpeg -y -i "${inputPath}" -vf "${vf}" -q:v 3 "${outputPath}"`, { timeout: 60 * 1000 });

    const stat = await fs.stat(outputPath).catch(() => null);
    if (!stat || stat.size < 1000) {
      await fs.unlink(outputPath).catch(() => {});
      return NextResponse.json({ ok: false, error: 'Crop came out empty — try a different photo.' }, { status: 422 });
    }

    return NextResponse.json({ ok: true, path: outputPublic });
  } catch (err: any) {
    console.error('[API Zoom Crop Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Crop failed' }, { status: 500 });
  }
}
