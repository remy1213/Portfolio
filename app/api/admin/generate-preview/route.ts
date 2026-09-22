import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execPromise = promisify(exec);
const ADMIN_PASSWORD = "remy";

export async function POST(req: Request) {
  // 1. Enforce local-only access for safety
  const host = req.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  if (!isLocal) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. This editor can only run locally.' }, { status: 403 });
  }

  try {
    const { password, videoFull, videoUrl, videoPreview, start, end, resolution } = await req.json();

    // 2. Validate password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    // 3. Validate output path, and require either a local file or a video link
    if (!videoPreview) {
      return NextResponse.json({ ok: false, error: 'Missing loop preview output path' }, { status: 400 });
    }
    if (!videoFull && !videoUrl) {
      return NextResponse.json({ ok: false, error: 'Add a full video file or a YouTube/Google Drive link first.' }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), 'public');
    const outputPath = path.resolve(path.join(publicDir, videoPreview));

    if (!outputPath.startsWith(publicDir)) {
      return NextResponse.json({ ok: false, error: 'Security constraint violation: paths must reside within the public/ directory.' }, { status: 403 });
    }

    // Resolve the ffmpeg input: a local file when it exists, otherwise the
    // direct stream URL of the YouTube/Google Drive upload (via yt-dlp —
    // it has a native Google Drive extractor, same code path as YouTube).
    let inputPath: string | null = null;
    if (videoFull) {
      const candidate = path.resolve(path.join(publicDir, videoFull));
      if (!candidate.startsWith(publicDir)) {
        return NextResponse.json({ ok: false, error: 'Security constraint violation: paths must reside within the public/ directory.' }, { status: 403 });
      }
      if (candidate === outputPath) {
        return NextResponse.json({ ok: false, error: 'The Full Quality Video Path and Loop Preview Path must be different. FFmpeg cannot read and write the same file in-place.' }, { status: 400 });
      }
      try {
        await fs.access(candidate);
        inputPath = candidate;
      } catch {
        inputPath = null;
      }
    }

    let inputUrl: string | null = null;
    if (!inputPath) {
      if (!videoUrl) {
        return NextResponse.json({ ok: false, error: `Full quality video not found on disk at: public${videoFull}` }, { status: 404 });
      }
      try {
        const youtubedl = (await import('youtube-dl-exec')).default;
        const maxHeight = resolution === '2160' || resolution === 'original' ? 2160 : resolution === '720' ? 720 : 1080;
        // Sort by "res" (the SMALLER dimension) capped at the chosen quality:
        // picks 1920x1080 for landscape and 1080x1920 for vertical Shorts.
        const out = await youtubedl(videoUrl, {
          getUrl: true,
          format: 'bv*[ext=mp4]/b[ext=mp4]/b',
          // the wrapper's types don't include "res:N" sorts, but yt-dlp accepts them
          formatSort: `res:${maxHeight}` as never,
          noWarnings: true,
        });
        inputUrl = String(out).trim().split('\n')[0];
        if (!inputUrl.startsWith('http')) throw new Error('Could not resolve a video stream from that link.');
      } catch (ytErr: any) {
        console.error('[Preview Gen] yt-dlp failed:', ytErr);
        return NextResponse.json({ ok: false, error: 'Could not read that link. Check it is correct and the video is not private (for Google Drive, sharing must be set to "Anyone with the link").' }, { status: 400 });
      }
    }

    // Parse start and end times
    const startTime = parseFloat(start) || 0;
    const endTime = parseFloat(end) || 0;
    const duration = endTime - startTime;

    if (duration <= 0) {
      return NextResponse.json({ ok: false, error: 'End time must be greater than start time.' }, { status: 400 });
    }

    // Ensure the output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Run FFmpeg:
    // -y: overwrite output
    // -ss: fast seeking before input
    // -t: cut duration
    // -an: remove audio for micro-sized looping previews
    // -c:v libx264 -crf 18 -preset medium: encode visually lossless premium quality H.264
    
    // Probe the input video codec name using ffprobe (local files only —
    // YouTube streams are always web-friendly H.264/VP9)
    let codecName = '';
    if (inputPath) {
      try {
        const probeCommand = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;
        const { stdout } = await execPromise(probeCommand);
        codecName = stdout.trim().toLowerCase();
        console.log(`[Preview Gen] Probed video codec: ${codecName}`);
      } catch (probeErr) {
        console.warn('[Preview Gen] Failed to probe video codec:', probeErr);
      }
    }

    // Configure decoder acceleration
    let decoderOption = '';
    if (codecName === 'av1') {
      // Use Nvidia hardware accelerated AV1 decoding since DaVinci exported with Nvidia AV1
      decoderOption = '-c:v av1_cuvid';
    }

    let scaleFilter = '';
    if (resolution === '720') {
      scaleFilter = '-vf "scale=720:-2"';
    } else if (resolution === '1080') {
      scaleFilter = '-vf "scale=1080:-2"';
    } else if (resolution === '2160') {
      scaleFilter = '-vf "scale=2160:-2"';
    } else if (resolution === 'original') {
      scaleFilter = ''; // Keep original 4K or higher resolution
    } else {
      scaleFilter = '-vf "scale=1080:-2"'; // Default
    }

    const input = inputPath ?? inputUrl;
    // Card previews are small muted loops: CRF 25 at 24fps is visually fine
    // there and roughly a third of the old visually-lossless size.
    // +faststart moves the index to the front so playback starts immediately;
    // yuv420p guarantees every browser can decode it.
    const command = `ffmpeg -y ${decoderOption} -ss ${startTime} -t ${duration} -i "${input}" ${scaleFilter} -r 24 -an -c:v libx264 -pix_fmt yuv420p -crf 25 -preset medium -movflags +faststart "${outputPath}"`;

    await execPromise(command, { timeout: 5 * 60 * 1000 });

    // ffmpeg can exit cleanly yet write an empty file (e.g. when the start
    // time is past the end of the video) — verify we actually got frames.
    let outDuration = 0;
    try {
      const { stdout } = await execPromise(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`
      );
      outDuration = parseFloat(stdout.trim()) || 0;
    } catch {
      outDuration = 0;
    }
    if (outDuration < 0.2) {
      await fs.unlink(outputPath).catch(() => {});
      return NextResponse.json(
        {
          ok: false,
          error: `The preview came out empty. This usually means the start time (${startTime}s) is past the end of the video — double-check the start/end seconds and try again.`,
        },
        { status: 422 }
      );
    }

    // Also pull one frame out as a poster image, so the card can paint
    // instantly before any video bytes load.
    let posterPublicPath: string | null = null;
    try {
      const posterPath = outputPath.replace(/\.[^.]+$/, '.jpg');
      await execPromise(`ffmpeg -y -i "${outputPath}" -frames:v 1 -q:v 4 "${posterPath}"`, { timeout: 60 * 1000 });
      posterPublicPath = videoPreview.replace(/\.[^.]+$/, '.jpg');
    } catch (posterErr) {
      console.warn('[Preview Gen] Poster extraction failed:', posterErr);
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully generated loop preview at public${videoPreview}`,
      poster: posterPublicPath,
    });
  } catch (err: any) {
    console.error('[API Preview Gen Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal server error during preview generation' }, { status: 500 });
  }
}
