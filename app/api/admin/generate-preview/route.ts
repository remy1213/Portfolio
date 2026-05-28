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
    const { password, videoFull, videoPreview, start, end, resolution } = await req.json();

    // 2. Validate password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    // 3. Validate paths exist and are valid
    if (!videoFull || !videoPreview) {
      return NextResponse.json({ ok: false, error: 'Missing input or output paths' }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), 'public');
    
    // Construct absolute paths
    const inputPath = path.resolve(path.join(publicDir, videoFull));
    const outputPath = path.resolve(path.join(publicDir, videoPreview));

    // Security check: ensure both paths are inside the public directory
    if (!inputPath.startsWith(publicDir) || !outputPath.startsWith(publicDir)) {
      return NextResponse.json({ ok: false, error: 'Security constraint violation: paths must reside within the public/ directory.' }, { status: 403 });
    }

    // Overwrite check: FFmpeg cannot write to the same file in-place
    if (inputPath === outputPath) {
      return NextResponse.json({ ok: false, error: 'The Full Quality Video Path and Loop Preview Path must be different. FFmpeg cannot read and write the same file in-place.' }, { status: 400 });
    }

    // Check if input file exists
    try {
      await fs.access(inputPath);
    } catch {
      return NextResponse.json({ ok: false, error: `Full quality video not found on disk at: public${videoFull}` }, { status: 404 });
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
    
    // Probe the input video codec name using ffprobe
    let codecName = '';
    try {
      const probeCommand = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;
      const { stdout } = await execPromise(probeCommand);
      codecName = stdout.trim().toLowerCase();
      console.log(`[Preview Gen] Probed video codec: ${codecName}`);
    } catch (probeErr) {
      console.warn('[Preview Gen] Failed to probe video codec:', probeErr);
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

    const command = `ffmpeg -y ${decoderOption} -ss ${startTime} -t ${duration} -i "${inputPath}" ${scaleFilter} -an -c:v libx264 -crf 18 -preset medium "${outputPath}"`;

    await execPromise(command);

    return NextResponse.json({ ok: true, message: `Successfully generated loop preview at public${videoPreview}` });
  } catch (err: any) {
    console.error('[API Preview Gen Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal server error during preview generation' }, { status: 500 });
  }
}
