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
 * Reads a Google Drive video's real dimensions so the project page can pick
 * a 9:16 or 16:9 frame — a Drive URL carries no orientation hint at all.
 *
 * ffprobe reads it straight off the direct-download URL, pulling only the
 * header rather than the whole file. (yt-dlp is no help here: its Drive
 * extractor reports no width/height.)
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
    const fileId = driveFileId(videoUrl);
    if (!fileId) {
      return NextResponse.json({ ok: false, error: 'Not a Google Drive link.' }, { status: 400 });
    }

    const directUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
    const { stdout } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${directUrl}"`,
      { timeout: 60 * 1000 }
    );

    const stream = JSON.parse(stdout)?.streams?.[0];
    const width = Number(stream?.width) || 0;
    const height = Number(stream?.height) || 0;
    if (!width || !height) {
      return NextResponse.json({ ok: false, error: 'Could not read the video. Check sharing is set to "Anyone with the link".' }, { status: 422 });
    }

    return NextResponse.json({ ok: true, width, height, vertical: height > width });
  } catch (err: any) {
    console.error('[Probe Video Error]:', err);
    return NextResponse.json({ ok: false, error: 'Could not read that link.' }, { status: 400 });
  }
}
