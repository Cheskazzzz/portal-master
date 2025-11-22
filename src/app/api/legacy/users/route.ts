import { NextResponse } from 'next/server';

// DB integration disabled — return empty list
export async function GET() {
  return NextResponse.json({ users: [] });
}
