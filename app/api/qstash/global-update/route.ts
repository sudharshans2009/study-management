import { NextRequest, NextResponse } from "next/server";
import { verifyQStashSignature } from "@/services/qstash";
import { processGlobalLazyUpdates } from "@/actions/global-update-actions";
import { db } from "@/database/drizzle";
import { globalUpdate } from "@/database/schema";

export async function POST(req: NextRequest) {
  try {
    // Verify QStash signature
    const signature = req.headers.get("upstash-signature");
    const body = await req.text();

    if (!signature || !(await verifyQStashSignature(signature, body))) {
      console.error("[QStash] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("[QStash] Processing hourly global updates...");

    // Process updates
    const result = await processGlobalLazyUpdates("qstash-hourly");

    if (result.success) {
      console.log("[QStash] Updates completed:", result.processedUsers, "users");

      return NextResponse.json({
        success: true,
        processedUsers: result.processedUsers,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error("[QStash] Updates failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Update failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[QStash] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
