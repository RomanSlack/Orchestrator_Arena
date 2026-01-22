"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface VoteButtonsProps {
  submissionId: string;
  yesVotes: number;
  noVotes: number;
}

export function VoteButtons({ submissionId, yesVotes, noVotes }: VoteButtonsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [currentVote, setCurrentVote] = useState<boolean | null>(null);
  const [localYesVotes, setLocalYesVotes] = useState(yesVotes);
  const [localNoVotes, setLocalNoVotes] = useState(noVotes);

  // Check if user has already voted
  useEffect(() => {
    async function checkVote() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: vote } = await supabase
          .from("votes")
          .select("vote")
          .eq("submission_id", submissionId)
          .eq("user_id", user.id)
          .single();

        if (vote) {
          setCurrentVote(vote.vote);
        }
      }
    }

    checkVote();
  }, [submissionId, supabase]);

  const handleVote = async (vote: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // Optimistic update
      const previousVote = currentVote;
      setCurrentVote(vote);

      if (previousVote !== null) {
        // Update existing vote
        if (previousVote !== vote) {
          setLocalYesVotes((v) => (vote ? v + 1 : v - 1));
          setLocalNoVotes((v) => (vote ? v - 1 : v + 1));
        }

        const { error } = await supabase
          .from("votes")
          .update({ vote })
          .eq("submission_id", submissionId)
          .eq("user_id", user.id);

        if (error) {
          // Rollback on error
          setCurrentVote(previousVote);
          setLocalYesVotes(yesVotes);
          setLocalNoVotes(noVotes);
          console.error("Error updating vote:", error);
        }
      } else {
        // New vote
        setLocalYesVotes((v) => (vote ? v + 1 : v));
        setLocalNoVotes((v) => (vote ? v : v + 1));

        const { error } = await supabase.from("votes").insert({
          submission_id: submissionId,
          user_id: user.id,
          vote,
        });

        if (error) {
          // Rollback on error
          setCurrentVote(null);
          setLocalYesVotes(yesVotes);
          setLocalNoVotes(noVotes);
          console.error("Error voting:", error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-muted-foreground mb-1">Would you use this?</p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={currentVote === true ? "default" : "outline"}
          onClick={() => handleVote(true)}
          disabled={loading}
          className={currentVote === true ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Yes ({localYesVotes})
        </Button>
        <Button
          size="sm"
          variant={currentVote === false ? "default" : "outline"}
          onClick={() => handleVote(false)}
          disabled={loading}
          className={currentVote === false ? "bg-red-600 hover:bg-red-700" : ""}
        >
          No ({localNoVotes})
        </Button>
      </div>
    </div>
  );
}
