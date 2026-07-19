import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ADMIN_PASSWORD = "remy";
const MEDIA_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|avif|mp4|webm|mov)$/i;

/** Lists every media file under public/images and public/videos with its
 *  size and whether the site's content currently references it. */
export async function POST(req: Request) {
  const host = req.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { password } = await req.json();
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    const publicDir = path.join(process.cwd(), 'public');
    const contentText = await fs.readFile(path.join(process.cwd(), 'data', 'content.json'), 'utf8');

    const walk = async (dir: string): Promise<string[]> => {
      const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
      const results: string[] = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...(await walk(full)));
        else if (MEDIA_EXTENSIONS.test(entry.name)) results.push(full);
      }
      return results;
    };

    const files = [
      ...(await walk(path.join(publicDir, 'images'))),
      ...(await walk(path.join(publicDir, 'videos'))),
    ];

    const items = await Promise.all(
      files.map(async (full) => {
        const stat = await fs.stat(full);
        const rel = '/' + path.relative(publicDir, full).split(path.sep).join('/');
        return {
          path: rel,
          size: stat.size,
          isVideo: /\.(mp4|webm|mov)$/i.test(rel),
          inUse: contentText.includes(rel) || rel === '/videos/hero.mp4',
        };
      })
    );

    items.sort((a, b) => b.size - a.size);
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Failed to list media' }, { status: 500 });
  }
}
