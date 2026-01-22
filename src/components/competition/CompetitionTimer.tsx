"use client";

import { useEffect, useState } from "react";
import type { Competition } from "@/types/database";
import {
  getEffectiveStatus,
  getNextTransition,
  formatTimeRemaining,
} from "@/lib/utils/competition-state";

interface CompetitionTimerProps {
  competition: Competition;
  compact?: boolean;
  onStatusChange?: () => void;
}

export function CompetitionTimer({
  competition,
  compact = false,
  onStatusChange,
}: CompetitionTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);

      // Check if status changed
      const currentStatus = getEffectiveStatus(competition);
      if (currentStatus !== getEffectiveStatus(competition)) {
        onStatusChange?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [competition, onStatusChange, mounted]);

  const status = getEffectiveStatus(competition);
  const nextTransition = getNextTransition(competition);

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    if (compact) {
      return <span className="text-muted-foreground">Loading...</span>;
    }
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">&nbsp;</p>
        <p className="text-3xl font-mono font-bold tracking-tight">--:--</p>
      </div>
    );
  }

  if (!nextTransition) {
    if (compact) {
      return <span className="text-muted-foreground">Completed</span>;
    }
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Competition ended</p>
      </div>
    );
  }

  const timeRemaining = formatTimeRemaining(nextTransition.time);

  const getLabel = () => {
    switch (status) {
      case "upcoming":
        return "Starts in";
      case "live":
        return "Ends in";
      case "voting":
        return "Voting ends in";
      default:
        return "";
    }
  };

  if (compact) {
    return (
      <span className="text-muted-foreground">
        {getLabel()}: <span className="font-mono font-medium text-foreground">{timeRemaining}</span>
      </span>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{getLabel()}</p>
      <p className="text-3xl font-mono font-bold tracking-tight">{timeRemaining}</p>
    </div>
  );
}
