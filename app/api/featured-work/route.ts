import { NextResponse } from 'next/server';
import { featuredItems } from '@/data/featured-work';

export async function GET() {
  return NextResponse.json({ items: featuredItems });
}
