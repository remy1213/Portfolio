# Preview generation script

This folder contains `create-preview.js` — a small Node.js helper that uses `ffmpeg` to create trimmed preview clips from your full videos.

Prerequisites
- Node.js (to run the script)
- ffmpeg installed and available in your PATH

Usage

From the repo root run:

```bash
node scripts/create-preview.js <inputFile> <startSec> <endSec> [--out <outputFile>] [--reencode]
```

Example (creates a 2→7s preview for `car.mp4`):

```bash
node scripts/create-preview.js car.mp4 2 7 --out car-preview.mp4
```

Behavior
- Attempts a fast `-c copy` extraction (`movflags +faststart`) first.
- If that fails, falls back to re-encoding (`libx264`, `aac`) for maximum compatibility.
- Prints a snippet to paste into `data/featured-work.ts`.

Notes
- Script assumes your videos live in `public/videos/`.
- The generated preview is written to `public/videos/<outputFile>`.

If you want, I can run the script now to generate previews for `car.mp4`, `poem.mp4`, and `vipc.mp4` (2→7s). Say "run" and I'll check for `ffmpeg` and execute it.