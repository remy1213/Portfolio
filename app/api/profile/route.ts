import { NextResponse } from 'next/server';
import { profileData } from '@/data/profile';

export async function GET() {
  return NextResponse.json({ profile: profileData });
}
