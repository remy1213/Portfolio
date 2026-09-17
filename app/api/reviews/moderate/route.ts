import { NextResponse } from 'next/server';
import { readReviews, writeReviews, reviewsBackend } from '@/lib/reviews-store';

const ADMIN_PASSWORD = "remy";

/** Admin-only (localhost): list all reviews, approve, decline, or delete. */
export async function POST(req: Request) {
  const host = req.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { password, action, id } = await req.json();
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    let reviews = await readReviews();

    if (action === 'approve') {
      const review = reviews.find((r) => r.id === id);
      if (review) review.status = 'approved';
    } else if (action === 'decline' || action === 'delete') {
      reviews = reviews.filter((r) => r.id !== id);
    } else if (action !== 'list') {
      return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
    }

    if (action !== 'list') {
      await writeReviews(reviews);
    }

    reviews.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return NextResponse.json({ ok: true, reviews, backend: reviewsBackend() });
  } catch (err: any) {
    console.error('[API Reviews Moderate Error]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Moderation failed' }, { status: 500 });
  }
}
