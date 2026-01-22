import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// This route is meant to be called by Vercel Cron
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/update-status", "schedule": "* * * * *" }] }

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (in production)
  const authHeader = request.headers.get("authorization");

  // In production, verify with CRON_SECRET
  if (process.env.NODE_ENV === "production") {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Use service role key for this operation (bypasses RLS)
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date().toISOString();

    // Update competitions that should be live
    const { data: toLive, error: liveError } = await supabaseAdmin
      .from("competitions")
      .update({ status: "live" })
      .eq("status", "upcoming")
      .lte("starts_at", now)
      .select("id, title");

    if (liveError) {
      console.error("Error updating to live:", liveError);
    }

    // Update competitions that should be voting
    const { data: toVoting, error: votingError } = await supabaseAdmin
      .from("competitions")
      .update({ status: "voting" })
      .eq("status", "live")
      .lte("ends_at", now)
      .select("id, title");

    if (votingError) {
      console.error("Error updating to voting:", votingError);
    }

    // Update competitions that should be completed
    const { data: toCompleted, error: completedError } = await supabaseAdmin
      .from("competitions")
      .update({ status: "completed" })
      .eq("status", "voting")
      .lte("voting_ends_at", now)
      .select("id, title");

    if (completedError) {
      console.error("Error updating to completed:", completedError);
    }

    const updates = {
      toLive: toLive?.map((c) => c.title) || [],
      toVoting: toVoting?.map((c) => c.title) || [],
      toCompleted: toCompleted?.map((c) => c.title) || [],
    };

    const totalUpdates =
      updates.toLive.length + updates.toVoting.length + updates.toCompleted.length;

    return NextResponse.json({
      success: true,
      message: `Updated ${totalUpdates} competitions`,
      updates,
      timestamp: now,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
