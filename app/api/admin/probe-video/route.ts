import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const ADMIN_PASSWORD = "remy";

/** The file ID inside a Google Drive share link, or null. */
function driveFileId(url: string): string | null {
  const m = url.trim().match(/drive\.google\.com\/(?:file\/d\/([\w-]{10,})|open\?id=([\w-]{10,}))/);
  return m ? m[1] || m[2] : null;
}

/**
 * Reads a Vimeo or Google Drive video's real dimensions so the project page
 * can pick a 9:16 or 16:9 frame — neither URL carries an orientation hint.
 *
 * Drive: ffprobe against the direct-download URL, which pulls only the
 * header rather than the whole file. (yt-dlp is no help: its Drive extractor
 * reports no width/height.)
 * Vimeo: the public oEmbed API. (yt-dlp's Vimeo extractor now demands
 * account credentials.)
 */
export async function POST(req: Request) {
  const host = req.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  if (!isLocal) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. This editor can only run locally.' }, { status: 403 });
  }

  try {
    const { password, videoUrl } = await req.json();
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }
    if (!videoUrl) {
      return NextResponse.json({ ok: false, error: 'Missing videoUrl' }, { status: 400 });
    }
    let width = 0;
    let height = 0;

    const fileId = driveFileId(videoUrl);
    if (fileId) {
      const directUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
      const { stdout } = await execPromise(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${directUrl}"`,
        { timeout: 60 * 1000 }
      );
      const stream = JSON.parse(stdout)?.streams?.[0];
      width = Number(stream?.width) || 0;
      height = Number(stream?.height) || 0;
    } else if (/vimeo\.com\//.test(videoUrl)) {
      // oEmbed returns scaled dimensions, but the aspect ratio is faithful —
      // which is all that orientation needs.
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl.trim())}`);
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: 'Vimeo could not read that link. Check the video is public or embeddable.' }, { status: 422 });
      }
      const info = await res.json();
      width = Number(info?.width) || 0;
      height = Number(info?.height) || 0;
    } else {
      return NextResponse.json({ ok: false, error: 'Only Vimeo and Google Drive links need an orientation check.' }, { status: 400 });
    }

    if (!width || !height) {
      return NextResponse.json({ ok: false, error: 'Could not read the video\'s dimensions. Check its sharing/privacy settings.' }, { status: 422 });
    }

    return NextResponse.json({ ok: true, width, height, vertical: height > width });
  } catch (err: any) {
    console.error('[Probe Video Error]:', err);
    return NextResponse.json({ ok: false, error: 'Could not read that link.' }, { status: 400 });
  }
}
