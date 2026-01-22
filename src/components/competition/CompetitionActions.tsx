"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Competition, Submission } from "@/types/database";
import { getEffectiveStatus, canJoin, canSubmit } from "@/lib/utils/competition-state";

interface CompetitionActionsProps {
  competition: Competition;
  isParticipant: boolean;
  userSubmission: Submission | null;
  userId?: string;
}

export function CompetitionActions({
  competition,
  isParticipant,
  userSubmission,
  userId,
}: CompetitionActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const status = getEffectiveStatus(competition);

  const handleJoin = async () => {
    if (!userId) {
      router.push(`/login?redirectTo=/competitions/${competition.id}`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("participants").insert({
        competition_id: competition.id,
        user_id: userId,
      });

      if (error) {
        console.error("Error joining competition:", error);
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("competition_id", competition.id)
        .eq("user_id", userId);

      if (error) {
        console.error("Error leaving competition:", error);
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Upcoming: Show join/leave buttons
  if (status === "upcoming") {
    if (isParticipant) {
      return (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            You&apos;re registered for this competition
          </span>
          <Button variant="outline" onClick={handleLeave} disabled={loading}>
            {loading ? "Leaving..." : "Leave"}
          </Button>
        </div>
      );
    }

    return (
      <Button onClick={handleJoin} disabled={loading}>
        {loading ? "Joining..." : "Join Competition"}
      </Button>
    );
  }

  // Live: Show submit button
  if (status === "live") {
    if (!isParticipant) {
      return (
        <p className="text-sm text-muted-foreground">
          You must join a competition before it starts to submit
        </p>
      );
    }

    if (userSubmission) {
      return (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            You&apos;ve submitted: {userSubmission.title}
          </span>
          <Button asChild variant="outline">
            <Link href={`/competitions/${competition.id}/submit`}>
              Edit Submission
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <Button asChild>
        <Link href={`/competitions/${competition.id}/submit`}>
          Submit Your Project
        </Link>
      </Button>
    );
  }

  // Voting: Show vote status
  if (status === "voting") {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Voting is open! Review submissions below and vote.
        </span>
        <Button asChild variant="outline">
          <Link href={`/competitions/${competition.id}/leaderboard`}>
            View Leaderboard
          </Link>
        </Button>
      </div>
    );
  }

  // Completed: Show leaderboard link
  return (
    <Button asChild variant="outline">
      <Link href={`/competitions/${competition.id}/leaderboard`}>
        View Final Results
      </Link>
    </Button>
  );
}
