import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// NOTE: reviews are stored in data/reviews.json on the server's disk.
// This works when the site runs on a real server (or locally). On
// serverless hosts like Vercel the filesystem is read-only per request,
// so submissions there need a database/KV store instead.

const reviewsPath = () => path.join(process.cwd(), 'data', 'reviews.json');

export type Review = {
  id: string;
  name: string;
  stars: number;
  text: string;
  date: string;
  status: 'pending' | 'approved';
};

async function readReviews(): Promise<Review[]> {
  try {
    return JSON.parse(await fs.readFile(reviewsPath(), 'utf8'));
  } catch {
    return [];
  }
}

/** Public: the approved reviews, newest first. */
export async function GET() {
  const reviews = await readReviews();
  const approved = reviews
    .filter((r) => r.status === 'approved')
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ id, name, stars, text, date }) => ({ id, name, stars, text, date }));
  return NextResponse.json({ ok: true, reviews: approved });
}

/** Public: submit a review — it waits as "pending" until approved in the admin. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim().slice(0, 60);
    const text = String(body.text || '').trim().slice(0, 1200);
    const stars = Math.min(5, Math.max(0, Math.round(Number(body.stars))));

    if (!name || !text || Number.isNaN(stars)) {
      return NextResponse.json({ ok: false, error: 'Please fill in your name, a rating, and a few words.' }, { status: 400 });
    }

    const reviews = await readReviews();
    if (reviews.filter((r) => r.status === 'pending').length >= 200) {
      return NextResponse.json({ ok: false, error: 'Too many pending reviews right now — try again later.' }, { status: 429 });
    }

    reviews.push({
      id: crypto.randomUUID(),
      name,
      stars,
      text,
      date: new Date().toISOString(),
      status: 'pending',
    });
    await fs.writeFile(reviewsPath(), JSON.stringify(reviews, null, 2) + '\n', 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[API Reviews Submit Error]:', err);
    return NextResponse.json({ ok: false, error: 'Could not save your review — please try again.' }, { status: 500 });
  }
}
