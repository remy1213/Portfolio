import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = "remy";

export async function POST(req: Request) {
  // Enforce local-only access for safety
  const host = req.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  if (!isLocal) {
    return NextResponse.json({ ok: false, error: 'Unauthorized. This editor can only run locally.' }, { status: 403 });
  }

  try {
    const { password } = await req.json();
    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
