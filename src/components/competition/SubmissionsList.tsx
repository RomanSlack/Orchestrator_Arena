"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/voting/VoteButtons";
import type { Profile, Submission, CompetitionStatus } from "@/types/database";

type SubmissionWithProfile = Submission & {
  profiles: Profile;
};

interface SubmissionsListProps {
  submissions: SubmissionWithProfile[];
  competitionStatus: CompetitionStatus;
  currentUserId?: string;
}

export function SubmissionsList({
  submissions,
  competitionStatus,
  currentUserId,
}: SubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No submissions yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission, index) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          rank={index + 1}
          competitionStatus={competitionStatus}
          isOwnSubmission={submission.user_id === currentUserId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

interface SubmissionCardProps {
  submission: SubmissionWithProfile;
  rank: number;
  competitionStatus: CompetitionStatus;
  isOwnSubmission: boolean;
  currentUserId?: string;
}

function SubmissionCard({
  submission,
  rank,
  competitionStatus,
  isOwnSubmission,
  currentUserId,
}: SubmissionCardProps) {
  const showVoting = competitionStatus === "voting" && !isOwnSubmission && currentUserId;
  const showVoteCounts = competitionStatus === "voting" || competitionStatus === "completed";

  return (
    <Card className={isOwnSubmission ? "border-primary/50" : ""}>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 text-center">
            <span className="text-lg font-bold text-muted-foreground">
              #{rank}
            </span>
          </div>

          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage
              src={submission.profiles.avatar_url || undefined}
              alt={submission.profiles.username}
            />
            <AvatarFallback>
              {submission.profiles.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{submission.title}</h3>
              {isOwnSubmission && (
                <Badge variant="outline" className="text-xs">
                  Your submission
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              by{" "}
              <Link
                href={`/profile/${submission.profiles.username}`}
                className="hover:underline"
              >
                {submission.profiles.username}
              </Link>
            </p>
            {submission.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {submission.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <a
                href={submission.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Repository
              </a>
              {submission.demo_url && (
                <a
                  href={submission.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Demo
                </a>
              )}
            </div>
          </div>

          {/* Vote counts / Voting buttons */}
          <div className="flex-shrink-0">
            {showVoting ? (
              <VoteButtons
                submissionId={submission.id}
                yesVotes={submission.yes_votes}
                noVotes={submission.no_votes}
              />
            ) : showVoteCounts ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {submission.yes_votes}
                </div>
                <div className="text-xs text-muted-foreground">yes votes</div>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
