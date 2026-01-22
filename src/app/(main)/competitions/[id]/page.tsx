import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CompetitionTimer } from "@/components/competition/CompetitionTimer";
import { CompetitionActions } from "@/components/competition/CompetitionActions";
import { SubmissionsList } from "@/components/competition/SubmissionsList";
import {
  getEffectiveStatus,
  getStatusLabel,
  getStatusVariant,
  isPromptVisible,
} from "@/lib/utils/competition-state";
import { format } from "date-fns";

interface CompetitionPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompetitionPage({ params }: CompetitionPageProps) {
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

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is a participant
  let isParticipant = false;
  if (user) {
    const { data: participation } = await supabase
      .from("participants")
      .select("id")
      .eq("competition_id", id)
      .eq("user_id", user.id)
      .single();
    isParticipant = !!participation;
  }

  // Get participant count
  const { count: participantCount } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("competition_id", id);

  // Get user's submission if any
  let userSubmission = null;
  if (user) {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("competition_id", id)
      .eq("user_id", user.id)
      .single();
    userSubmission = data;
  }

  // Get all submissions for this competition (with profiles)
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
  const showPrompt = isPromptVisible(competition);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {competition.title}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {competition.description}
              </p>
            </div>
            <Badge variant={getStatusVariant(status)} className="text-sm">
              {getStatusLabel(status)}
            </Badge>
          </div>

          {/* Timer */}
          <Card className="mb-6">
            <CardContent className="py-6">
              <CompetitionTimer competition={competition} />
            </CardContent>
          </Card>

          {/* Actions */}
          <CompetitionActions
            competition={competition}
            isParticipant={isParticipant}
            userSubmission={userSubmission}
            userId={user?.id}
          />
        </div>

        <Separator className="my-8" />

        {/* Competition Details */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starts</span>
                <span>{format(new Date(competition.starts_at), "PPp")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ends</span>
                <span>{format(new Date(competition.ends_at), "PPp")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voting ends</span>
                <span>{format(new Date(competition.voting_ends_at), "PPp")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participants</span>
                <span>{participantCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submissions</span>
                <span>{submissions?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompt Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Challenge Prompt</CardTitle>
            {!showPrompt && (
              <CardDescription>
                The prompt will be revealed when the competition starts
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {showPrompt ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{competition.prompt}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Hidden until competition starts
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions Section */}
        {(status === "live" || status === "voting" || status === "completed") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submissions</CardTitle>
              <CardDescription>
                {status === "voting"
                  ? "Vote on submissions below"
                  : status === "completed"
                  ? "Final results"
                  : "Submissions so far"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionsList
                submissions={submissions || []}
                competitionStatus={status}
                currentUserId={user?.id}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
