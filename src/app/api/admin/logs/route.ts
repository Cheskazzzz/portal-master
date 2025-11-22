import { NextResponse } from "next/server";
import { requireRole } from "~/server/lib/session";
import { getAuditLogs, getClientIp, getUserAgent } from "~/server/lib/logger";

export async function GET(request: Request) {
  try {
    // Require admin role
    await requireRole(["ADMIN"], request);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? undefined;
    const action = searchParams.get("action") ?? undefined;
    const resource = searchParams.get("resource") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const logs = await getAuditLogs({
      userId,
      action: action as any,
      resource,
      limit,
      offset,
    });

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Log this access
    const session = await requireRole(["ADMIN"], request);
    const { createAuditLog } = await import("~/server/lib/logger");
    await createAuditLog({
      userId: session.userId,
      action: "DATA_ACCESS",
      resource: "audit_log",
      ipAddress,
      userAgent,
      details: {
        filters: { userId, action, resource },
        limit,
        offset,
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

