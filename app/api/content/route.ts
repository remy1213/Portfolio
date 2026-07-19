import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Returns the live content.json from disk (not the bundled copy) so the
// admin always edits the latest saved version.
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'content.json');
    const text = await fs.readFile(filePath, 'utf8');
    return NextResponse.json({ ok: true, content: JSON.parse(text) });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Failed to read content' }, { status: 500 });
  }
}
