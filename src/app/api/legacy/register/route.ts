import { NextResponse } from 'next/server';

// DB integration disabled — this route is left as a harmless stub.
export async function POST() {
  return NextResponse.json({ error: 'DB integration disabled' }, { status: 404 });
}
