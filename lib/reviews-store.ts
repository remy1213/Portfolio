import fs from 'fs/promises';
import path from 'path';

/**
 * Review storage. Two backends, picked automatically:
 *
 * - Upstash Redis (free) when its env vars are set — this is what production
 *   needs, since serverless hosts like Vercel can't write files. Vercel's
 *   storage marketplace provisions Upstash and injects these vars for you.
 * - The local data/reviews.json file otherwise (local dev without setup).
 *
 * Put the same two vars in .env.local and your local admin moderates the
 * same store the live site uses.
 */

export type Review = {
  id: string;
  name: string;
  stars: number;
  text: string;
  date: string;
  status: 'pending' | 'approved';
};

const REDIS_KEY = 'portfolio:reviews';

function redisConfig() {
  // Vercel prefixes the injected vars with the name you chose when
  // connecting the database ("remy"), so check that spelling too.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.remy_KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.remy_KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

const filePath = () => path.join(process.cwd(), 'data', 'reviews.json');

export async function readReviews(): Promise<Review[]> {
  const redis = redisConfig();
  if (redis) {
    const res = await fetch(`${redis.url}/get/${REDIS_KEY}`, {
      headers: { Authorization: `Bearer ${redis.token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Review store read failed (${res.status})`);
    const data = await res.json();
    if (!data.result) return [];
    try {
      const parsed = JSON.parse(data.result);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  try {
    const parsed = JSON.parse(await fs.readFile(filePath(), 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeReviews(reviews: Review[]): Promise<void> {
  const redis = redisConfig();
  if (redis) {
    const res = await fetch(`${redis.url}/set/${REDIS_KEY}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${redis.token}` },
      body: JSON.stringify(reviews),
    });
    if (!res.ok) throw new Error(`Review store write failed (${res.status})`);
    return;
  }

  await fs.writeFile(filePath(), JSON.stringify(reviews, null, 2) + '\n', 'utf8');
}

/** Which backend is active — surfaced in the admin so it's never a mystery. */
export function reviewsBackend(): 'redis' | 'file' {
  return redisConfig() ? 'redis' : 'file';
}
