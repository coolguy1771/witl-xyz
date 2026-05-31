import { NextResponse } from "next/server";
import { runStatusChecks } from "@/app/lib/status-checks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await runStatusChecks();
    const statusCode = report.status === "down" ? 503 : 200;

    return NextResponse.json(report, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error in /api/status:", error);
    return NextResponse.json(
      {
        status: "down",
        checkedAt: new Date().toISOString(),
        checks: [],
        error: "Status check failed",
      },
      { status: 500 }
    );
  }
}
