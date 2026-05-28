import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ADMIN_PASSWORD = "remy";

export async function POST(req: Request) {
  // Enforce local-only access for safety
  const host = req.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  if (!isLocal) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. This editor can only run locally.' }, { status: 403 });
  }

  try {
    const { password, profile } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    if (!profile) {
      return NextResponse.json({ ok: false, error: 'Missing profile details' }, { status: 400 });
    }

    // Clean up text inputs
    const cleanedProfile = {
      aboutHeadline: (profile.aboutHeadline || '').trim(),
      aboutSubheading: (profile.aboutSubheading || '').trim(),
      aboutBio1: (profile.aboutBio1 || '').trim(),
      aboutBio2: (profile.aboutBio2 || '').trim(),
      contactHeadline: (profile.contactHeadline || '').trim(),
      contactSubheading: (profile.contactSubheading || '').trim(),
      contactEmail: (profile.contactEmail || '').trim(),
      contactLocation: (profile.contactLocation || '').trim(),
    };

    const filePath = path.join(process.cwd(), 'data', 'profile.ts');
    const fileContent = `export type ProfileData = {
  aboutHeadline: string;
  aboutSubheading: string;
  aboutBio1: string;
  aboutBio2: string;
  contactHeadline: string;
  contactSubheading: string;
  contactEmail: string;
  contactLocation: string;
};

export const profileData: ProfileData = ${JSON.stringify(cleanedProfile, null, 2)};
`;

    await fs.writeFile(filePath, fileContent, 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[API Profile Update Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
