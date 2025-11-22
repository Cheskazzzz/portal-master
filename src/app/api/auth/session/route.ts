import { NextResponse } from 'next/server';
import { validateSession } from '~/server/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const sessionToken = (await cookies()).get('portal_session')?.value;

  if (!sessionToken) {
    return NextResponse.json({ isAuth: false }, { status: 401 });
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    return NextResponse.json({ isAuth: false }, { status: 401 });
  }

  return NextResponse.json({ isAuth: true, email: session.email });
}