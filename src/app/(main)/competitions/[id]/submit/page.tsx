import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionForm } from "@/components/submission/SubmissionForm";
import { getEffectiveStatus, canSubmit } from "@/lib/utils/competition-state";

interface SubmitPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/competitions/${id}/submit`);
  }

  // Get competition
  const { data: competition, error } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !competition) {
    notFound();
  }

  // Check if competition is live
  const status = getEffectiveStatus(competition);
  if (status !== "live") {
    redirect(`/competitions/${id}`);
  }

  // Check if user is a participant
  const { data: participation } = await supabase
    .from("participants")
    .select("id")
    .eq("competition_id", id)
    .eq("user_id", user.id)
    .single();

  if (!participation) {
    redirect(`/competitions/${id}`);
  }

  // Get existing submission if any
  const { data: existingSubmission } = await supabase
    .from("submissions")
    .select("*")
    .eq("competition_id", id)
    .eq("user_id", user.id)
    .single();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {existingSubmission ? "Edit Submission" : "Submit Your Project"}
            </CardTitle>
            <CardDescription>
              {existingSubmission
                ? `Update your submission for "${competition.title}"`
                : `Submit your project for "${competition.title}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              competitionId={id}
              userId={user.id}
              existingSubmission={existingSubmission}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
