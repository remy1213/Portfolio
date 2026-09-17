#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/create-preview.js <inputFile> <startSec> <endSec> [--out <outputFile>] [--reencode]');
  console.log('Example: node scripts/create-preview.js car.mp4 2 7 --out car-preview.mp4');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 3) usage();

const inputFile = args[0];
const start = parseFloat(args[1]);
const end = parseFloat(args[2]);
if (isNaN(start) || isNaN(end) || end <= start) {
  console.error('Invalid start/end. Ensure numeric and end > start.');
  process.exit(1);
}

let outIndex = args.indexOf('--out');
let outFile = outIndex !== -1 ? args[outIndex + 1] : null;
const reencode = args.includes('--reencode');

const publicVideos = path.join(process.cwd(), 'public', 'videos');
const inputPath = path.join(publicVideos, inputFile);
if (!fs.existsSync(inputPath)) {
  console.error('Input file not found:', inputPath);
  process.exit(1);
}

if (!outFile) {
  const base = path.parse(inputFile).name;
  outFile = `${base}-preview.mp4`;
}
const outPath = path.join(publicVideos, outFile);
const duration = end - start;

function checkFFmpeg() {
  try {
    const res = spawnSync('ffmpeg', ['-version']);
    return res.status === 0;
  } catch (e) {
    return false;
  }
}

if (!checkFFmpeg()) {
  console.error('ffmpeg not found in PATH. Install ffmpeg and try again.');
  process.exit(1);
}

console.log(`Creating preview ${outFile} from ${inputFile} ${start}s→${end}s (duration ${duration}s)`);

// Try fast copy first
try {
  const copyCmd = `ffmpeg -y -ss ${start} -i "${inputPath}" -t ${duration} -c copy -movflags +faststart "${outPath}"`;
  console.log('Running:', copyCmd);
  execSync(copyCmd, { stdio: 'inherit' });
  console.log('Preview created (copy).', outPath);
} catch (err) {
  console.warn('Copy failed, trying re-encode...');
  try {
    const encCmd = `ffmpeg -y -ss ${start} -i "${inputPath}" -t ${duration} -c:v libx264 -crf 23 -preset veryfast -c:a aac -movflags +faststart "${outPath}"`;
    console.log('Running:', encCmd);
    execSync(encCmd, { stdio: 'inherit' });
    console.log('Preview created (re-encoded).', outPath);
  } catch (err2) {
    console.error('Preview creation failed. See ffmpeg output above.');
    process.exit(1);
  }
}

console.log('\nNow update your data/featured-work.ts to use the preview file:');
console.log(`{
  title: 'Your Title',
  videoPreview: '/videos/${outFile}',
  videoPreviewStart: 0,
  videoPreviewEnd: ${Math.round(duration)},
  videoFull: '/videos/${inputFile}',
}`);

console.log('\nDone.');
