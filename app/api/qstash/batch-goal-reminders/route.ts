import { NextRequest, NextResponse } from "next/server";
import { verifyQStashSignature } from "@/services/qstash";
import { db } from "@/database/drizzle";
import { user, goal, studySession } from "@/database/schema";
import { eq, and, gte } from "drizzle-orm";

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

    console.log("[QStash] Processing batch goal reminders...");

    // Get users with active daily goals
    const usersWithGoals = await db
      .select({
        userId: goal.userId,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
      })
      .from(goal)
      .innerJoin(user, eq(goal.userId, user.id))
      .where(
        and(
          eq(goal.status, "active"),
          eq(goal.period, "daily")
        )
      )
      .limit(100); // Max 100 per batch

    // Get start of today in UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check who hasn't studied today
    const usersNeedingReminder: Array<{
      userId: string;
      email: string;
      name: string;
    }> = [];

    for (const userData of usersWithGoals) {
      const sessions = await db
        .select({ id: studySession.id })
        .from(studySession)
        .where(
          and(
            eq(studySession.userId, userData.userId),
            eq(studySession.status, "completed"),
            gte(studySession.startedAt, today)
          )
        )
        .limit(1);

      if (sessions.length === 0) {
        usersNeedingReminder.push({
          userId: userData.userId,
          email: userData.email || "",
          name: userData.name,
        });
      }
    }

    console.log(
      `[QStash] Sending reminders to ${usersNeedingReminder.length} users`
    );

    // TODO: Integrate with email service
    // Example with Resend:
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // 
    // for (const user of usersNeedingReminder) {
    //   await resend.emails.send({
    //     from: 'SS.Study <reminders@ss.study>',
    //     to: user.email,
    //     subject: "Don't forget your study goal today!",
    //     html: `<p>Hi ${user.name},</p><p>You haven't studied today...</p>`,
    //   });
    // }

    return NextResponse.json({
      success: true,
      checked: usersWithGoals.length,
      reminded: usersNeedingReminder.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[QStash] Batch goal reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
