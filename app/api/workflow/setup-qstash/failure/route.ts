import { NextRequest, NextResponse } from "next/server";

/**
 * Workflow failure handler
 * 
 * This endpoint is called when the QStash setup workflow fails after all retries.
 * It can be used to send alerts, log errors, or trigger manual intervention.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.error("[Workflow] QStash setup failed after retries:", {
      workflowRunId: body.workflowRunId,
      error: body.error,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send alert via email/Slack/Discord
    // await sendAlert({
    //   title: "QStash Setup Workflow Failed",
    //   message: `Workflow ${body.workflowRunId} failed: ${body.error}`,
    //   severity: "high",
    // });

    return NextResponse.json({
      success: true,
      message: "Failure logged",
    });
  } catch (error) {
    console.error("[Workflow] Failed to process failure notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
