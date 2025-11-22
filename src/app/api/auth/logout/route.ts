import { NextResponse } from "next/server";
import { getSession, logout as logoutSession } from "~/server/lib/session";
import { getClientIp, getUserAgent } from "~/server/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await getSession(request);

    if (session) {
      const ipAddress = getClientIp(request);
      const userAgent = getUserAgent(request);
      await logoutSession(session.sessionToken, request);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


