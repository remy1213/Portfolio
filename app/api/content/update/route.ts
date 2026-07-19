import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ADMIN_PASSWORD = "remy";

function isLocalRequest(req: Request) {
  const host = req.headers.get('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
}

export async function POST(req: Request) {
  if (!isLocalRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. This editor can only run locally.' }, { status: 403 });
  }

  try {
    const { password, content } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    if (!content || typeof content !== 'object' || !content.profile || !Array.isArray(content.featuredWork)) {
      return NextResponse.json({ ok: false, error: 'Invalid content structure' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'content.json');

    // Keep one backup of the previous version in case a save goes wrong.
    try {
      const prev = await fs.readFile(filePath, 'utf8');
      await fs.writeFile(path.join(process.cwd(), 'data', 'content.backup.json'), prev, 'utf8');
    } catch {
      // no previous file — nothing to back up
    }

    await fs.writeFile(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[API Content Update Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
