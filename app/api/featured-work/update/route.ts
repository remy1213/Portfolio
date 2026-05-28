import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the password for local admin modifications
const ADMIN_PASSWORD = "remy";

export async function POST(req: Request) {
  // 1. Enforce local-only access for safety
  const host = req.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  if (!isLocal) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. This editor can only run locally.' }, { status: 403 });
  }

  try {
    const { password, items } = await req.json();

    // 2. Validate password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    if (!Array.isArray(items)) {
      return NextResponse.json({ ok: false, error: 'Invalid items data structure' }, { status: 400 });
    }

    // 3. Clean up the items to match the type structure
    const cleanedItems = items.map((it: any) => ({
      slug: (it.slug || '').trim().toLowerCase().replace(/\s+/g, '-'),
      title: (it.title || '').trim(),
      img: it.img ? it.img.trim() : undefined,
      videoPreview: it.videoPreview ? it.videoPreview.trim() : undefined,
      videoPreviewStart: typeof it.videoPreviewStart === 'number' ? it.videoPreviewStart : undefined,
      videoPreviewEnd: typeof it.videoPreviewEnd === 'number' ? it.videoPreviewEnd : undefined,
      videoFull: it.videoFull ? it.videoFull.trim() : undefined,
      link: it.link ? it.link.trim() : undefined,
      description: it.description ? it.description.trim() : undefined,
      client: it.client ? it.client.trim() : undefined,
      role: it.role ? it.role.trim() : undefined,
      date: it.date ? it.date.trim() : undefined,
      gear: Array.isArray(it.gear) ? it.gear.map((g: string) => g.trim()).filter(Boolean) : [],
      photos: Array.isArray(it.photos) ? it.photos.map((p: string) => p.trim()).filter(Boolean) : [],
    }));

    // 4. Regenerate the data/featured-work.ts file content
    const filePath = path.join(process.cwd(), 'data', 'featured-work.ts');
    const fileContent = `// Featured work items displayed as large cards.
// Supports image or video preview with full project detail page.
export type FeaturedItem = {
  slug: string; // Unique URL slug (e.g., 'porsche-718-spyder')
  title: string;
  img?: string; // Static fallback image
  videoPreview?: string; // Small looping preview video path
  videoPreviewStart?: number; // Looping preview start point
  videoPreviewEnd?: number; // Looping preview end point
  videoFull?: string; // Path to full quality video
  link?: string; // External backup link
  
  // Detailed page attributes
  description?: string; // Narrative overview
  client?: string; // Who the shoot was for
  role?: string; // What you did (e.g., Director, Editor, DP)
  date?: string; // Completion date
  gear?: string[]; // Camera gear, lens, software used
  photos?: string[]; // Array of high-quality shoot photos/stills
};

export const featuredItems: FeaturedItem[] = ${JSON.stringify(cleanedItems, null, 2)};
`;

    // 5. Write the file back to disk
    await fs.writeFile(filePath, fileContent, 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[API Admin Update Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
