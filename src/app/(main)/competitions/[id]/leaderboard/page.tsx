import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getEffectiveStatus,
  getStatusLabel,
  getStatusVariant,
} from "@/lib/utils/competition-state";
import type { Profile, Submission } from "@/types/database";

interface LeaderboardPageProps {
  params: Promise<{ id: string }>;
}

type SubmissionWithProfile = Submission & {
  profiles: Profile;
};

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get competition
  const { data: competition, error } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !competition) {
    notFound();
  }

  // Get all submissions with profiles, sorted by yes votes
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        avatar_url,
        github_username
      )
    `)
    .eq("competition_id", id)
    .order("yes_votes", { ascending: false });

  const status = getEffectiveStatus(competition);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/competitions/${id}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              ← Back to competition
            </Link>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
              <p className="mt-1 text-muted-foreground">{competition.title}</p>
            </div>
            <Badge variant={getStatusVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
          </div>
        </div>

        {/* Leaderboard */}
        {submissions && submissions.length > 0 ? (
          <div className="space-y-4">
            {/* Top 3 podium */}
            {submissions.length >= 1 && (
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                {/* Second place */}
                {submissions.length >= 2 && (
                  <div className="order-1 md:order-none">
                    <PodiumCard
                      submission={submissions[1] as SubmissionWithProfile}
                      rank={2}
                    />
                  </div>
                )}

                {/* First place */}
                <div className="order-0 md:order-none">
                  <PodiumCard
                    submission={submissions[0] as SubmissionWithProfile}
                    rank={1}
                    featured
                  />
                </div>

                {/* Third place */}
                {submissions.length >= 3 && (
                  <div className="order-2 md:order-none">
                    <PodiumCard
                      submission={submissions[2] as SubmissionWithProfile}
                      rank={3}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Rest of the rankings */}
            {submissions.length > 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submissions.slice(3).map((submission, index) => (
                      <RankingRow
                        key={submission.id}
                        submission={submission as SubmissionWithProfile}
                        rank={index + 4}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No submissions yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PodiumCard({
  submission,
  rank,
  featured = false,
}: {
  submission: SubmissionWithProfile;
  rank: number;
  featured?: boolean;
}) {
  const getRankColor = () => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getRankEmoji = () => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  };

  return (
    <Card className={featured ? "border-yellow-500/50 shadow-lg" : ""}>
      <CardContent className="pt-6 text-center">
        <div className={`text-4xl mb-2 ${getRankColor()}`}>
          {getRankEmoji()}
        </div>
        <Avatar className="h-16 w-16 mx-auto mb-3">
          <AvatarImage
            src={submission.profiles.avatar_url || undefined}
            alt={submission.profiles.username}
          />
          <AvatarFallback className="text-lg">
            {submission.profiles.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold truncate">{submission.title}</h3>
        <Link
          href={`/profile/${submission.profiles.username}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          {submission.profiles.username}
        </Link>
        <div className="mt-4">
          <div className="text-3xl font-bold text-green-600">
            {submission.yes_votes}
          </div>
          <div className="text-xs text-muted-foreground">yes votes</div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <a
              href={submission.repo_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Repo
            </a>
          </Button>
          {submission.demo_url && (
            <Button size="sm" variant="outline" asChild>
              <a
                href={submission.demo_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Demo
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RankingRow({
  submission,
  rank,
}: {
  submission: SubmissionWithProfile;
  rank: number;
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="w-8 text-center font-mono text-muted-foreground">
        #{rank}
      </span>
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={submission.profiles.avatar_url || undefined}
          alt={submission.profiles.username}
        />
        <AvatarFallback className="text-xs">
          {submission.profiles.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{submission.title}</p>
        <Link
          href={`/profile/${submission.profiles.username}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          {submission.profiles.username}
        </Link>
      </div>
      <div className="text-right">
        <div className="font-semibold text-green-600">{submission.yes_votes}</div>
        <div className="text-xs text-muted-foreground">votes</div>
      </div>
    </div>
  );
}
