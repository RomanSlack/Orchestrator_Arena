import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import type { Competition, Submission } from "@/types/database";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Get profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Get user's submissions with competition info
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      competitions:competition_id (
        id,
        title,
        status,
        starts_at,
        ends_at,
        voting_ends_at
      )
    `)
    .eq("user_id", profile.id)
    .order("submitted_at", { ascending: false });

  // Get competitions user participated in
  const { data: participations } = await supabase
    .from("participants")
    .select(`
      *,
      competitions:competition_id (
        id,
        title,
        status
      )
    `)
    .eq("user_id", profile.id);

  // Calculate stats
  const stats = {
    competitionsEntered: participations?.length || 0,
    submissionsMade: submissions?.length || 0,
    totalYesVotes: submissions?.reduce((sum, s) => sum + s.yes_votes, 0) || 0,
    bestPlacement: null as number | null,
  };

  // Calculate best placement
  if (submissions && submissions.length > 0) {
    for (const submission of submissions) {
      // Get all submissions for this competition to determine placement
      const { data: compSubmissions } = await supabase
        .from("submissions")
        .select("id, yes_votes")
        .eq("competition_id", submission.competition_id)
        .order("yes_votes", { ascending: false });

      if (compSubmissions) {
        const placement = compSubmissions.findIndex((s) => s.id === submission.id) + 1;
        if (!stats.bestPlacement || placement < stats.bestPlacement) {
          stats.bestPlacement = placement;
        }
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                <AvatarFallback className="text-2xl">
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <p className="text-muted-foreground">
                  Joined {format(new Date(profile.created_at), "MMMM yyyy")}
                </p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://github.com/${profile.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      @{profile.github_username}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{stats.competitionsEntered}</div>
              <div className="text-sm text-muted-foreground">Competitions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{stats.submissionsMade}</div>
              <div className="text-sm text-muted-foreground">Submissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.totalYesVotes}
              </div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">
                {stats.bestPlacement ? `#${stats.bestPlacement}` : "-"}
              </div>
              <div className="text-sm text-muted-foreground">Best Finish</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions History */}
        <Card>
          <CardHeader>
            <CardTitle>Competition History</CardTitle>
            <CardDescription>Past submissions and results</CardDescription>
          </CardHeader>
          <CardContent>
            {submissions && submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => {
                  const competition = submission.competitions as Competition;
                  return (
                    <div
                      key={submission.id}
                      className="flex items-start justify-between gap-4 py-3 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/competitions/${competition.id}`}
                          className="font-medium hover:underline"
                        >
                          {submission.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {competition.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {format(new Date(submission.submitted_at), "PPP")}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{competition.status}</Badge>
                        <div className="mt-2">
                          <span className="text-lg font-semibold text-green-600">
                            {submission.yes_votes}
                          </span>
                          <span className="text-sm text-muted-foreground"> votes</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
