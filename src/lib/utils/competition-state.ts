import type { Competition, CompetitionStatus } from "@/types/database";

/**
 * Calculate the effective status of a competition based on current time
 * This is the source of truth for competition state
 */
export function getEffectiveStatus(competition: {
  starts_at: string;
  ends_at: string;
  voting_ends_at: string;
}): CompetitionStatus {
  const now = new Date();
  const startsAt = new Date(competition.starts_at);
  const endsAt = new Date(competition.ends_at);
  const votingEndsAt = new Date(competition.voting_ends_at);

  if (now < startsAt) return "upcoming";
  if (now < endsAt) return "live";
  if (now < votingEndsAt) return "voting";
  return "completed";
}

/**
 * Get the next status transition time
 */
export function getNextTransition(competition: {
  starts_at: string;
  ends_at: string;
  voting_ends_at: string;
}): { status: CompetitionStatus; time: Date } | null {
  const now = new Date();
  const startsAt = new Date(competition.starts_at);
  const endsAt = new Date(competition.ends_at);
  const votingEndsAt = new Date(competition.voting_ends_at);

  if (now < startsAt) {
    return { status: "live", time: startsAt };
  }
  if (now < endsAt) {
    return { status: "voting", time: endsAt };
  }
  if (now < votingEndsAt) {
    return { status: "completed", time: votingEndsAt };
  }
  return null;
}

/**
 * Format time remaining until a date
 */
export function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return "0s";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: CompetitionStatus): string {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "live":
      return "Live";
    case "voting":
      return "Voting";
    case "completed":
      return "Completed";
    default:
      return "Unknown";
  }
}

/**
 * Get status badge color variant
 */
export function getStatusVariant(
  status: CompetitionStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "upcoming":
      return "secondary";
    case "live":
      return "destructive";
    case "voting":
      return "default";
    case "completed":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Check if user can join the competition
 */
export function canJoin(competition: Competition): boolean {
  return getEffectiveStatus(competition) === "upcoming";
}

/**
 * Check if user can submit to the competition
 */
export function canSubmit(competition: Competition): boolean {
  return getEffectiveStatus(competition) === "live";
}

/**
 * Check if user can vote on submissions
 */
export function canVote(competition: Competition): boolean {
  return getEffectiveStatus(competition) === "voting";
}

/**
 * Check if prompt should be visible
 * Prompt is hidden during upcoming, shown during live and after
 */
export function isPromptVisible(competition: Competition): boolean {
  const status = getEffectiveStatus(competition);
  return status !== "upcoming";
}
