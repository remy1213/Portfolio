import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const ADMIN_PASSWORD = "remy";
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg',
  '.mp4', '.webm', '.mov',
]);

function isLocalRequest(req: Request) {
  const host = req.headers.get('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
}

export async function POST(req: Request) {
  if (!isLocalRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. Uploads only work locally.' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const password = formData.get('password');
    const file = formData.get('file');

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ ok: false, error: `File type ${ext || '(none)'} not allowed. Use images or videos.` }, { status: 400 });
    }

    // Sanitize the base name so paths stay clean and web-safe.
    const base = path.basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'upload';

    const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
    const dir = isVideo ? 'videos' : 'images';
    const uploadDir = path.join(process.cwd(), 'public', dir, 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Avoid overwriting an existing file by suffixing a counter.
    let fileName = `${base}${ext}`;
    let counter = 1;
    while (true) {
      try {
        await fs.access(path.join(uploadDir, fileName));
        fileName = `${base}-${counter++}${ext}`;
      } catch {
        break;
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fullPath = path.join(uploadDir, fileName);
    await fs.writeFile(fullPath, buffer);

    // Optionally produce a downscaled web version alongside big images
    // (used by the zoom-showcase section as its fast base layer).
    let previewPath: string | null = null;
    if (formData.get('downscale') && !isVideo && buffer.length > 1_500_000) {
      try {
        const webName = fileName.replace(/\.[^.]+$/, '') + '-web.jpg';
        await execPromise(
          `ffmpeg -y -i "${fullPath}" -vf "scale='min(2000,iw)':-2" -q:v 4 "${path.join(uploadDir, webName)}"`,
          { timeout: 60 * 1000 }
        );
        previewPath = `/${dir}/uploads/${webName}`;
      } catch (err) {
        console.warn('[Upload] Downscale failed:', err);
      }
    }

    return NextResponse.json({ ok: true, path: `/${dir}/uploads/${fileName}`, preview: previewPath });
  } catch (err: any) {
    console.error('[API Upload Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Upload failed' }, { status: 500 });
  }
}
