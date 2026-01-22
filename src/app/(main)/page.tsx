import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  // Get count of active/upcoming competitions
  const { count: competitionCount } = await supabase
    .from("competitions")
    .select("*", { count: "exact", head: true });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Orchestrator Arena
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Compete in time-boxed coding competitions. Build real projects. Get
          community feedback. Ship something awesome in hours, not months.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/competitions">Browse Competitions</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-lg font-semibold">Join</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign up for upcoming competitions before they start
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-lg font-semibold">Build</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              When the timer starts, build your solution and submit your repo
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-lg font-semibold">Vote</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              After submissions close, vote on projects: Would you use this?
            </p>
          </div>
        </div>

        {competitionCount !== null && competitionCount > 0 && (
          <p className="mt-12 text-sm text-muted-foreground">
            {competitionCount} competition{competitionCount === 1 ? "" : "s"} available
          </p>
        )}
      </div>
    </div>
  );
}
