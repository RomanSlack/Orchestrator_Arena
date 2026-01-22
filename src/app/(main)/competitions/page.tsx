import { createClient } from "@/lib/supabase/server";
import { CompetitionCard } from "@/components/competition/CompetitionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEffectiveStatus } from "@/lib/utils/competition-state";
import type { Competition, CompetitionStatus } from "@/types/database";

async function getCompetitionsWithCounts() {
  const supabase = await createClient();

  // Get all competitions
  const { data: competitions, error } = await supabase
    .from("competitions")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error || !competitions) {
    console.error("Error fetching competitions:", error);
    return [];
  }

  // Get participant counts for each competition
  const competitionsWithCounts = await Promise.all(
    competitions.map(async (comp) => {
      const { count } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("competition_id", comp.id);

      return {
        ...comp,
        participant_count: count || 0,
      };
    })
  );

  return competitionsWithCounts;
}

function groupCompetitionsByStatus(
  competitions: (Competition & { participant_count: number })[]
) {
  const groups: Record<CompetitionStatus, typeof competitions> = {
    upcoming: [],
    live: [],
    voting: [],
    completed: [],
  };

  for (const comp of competitions) {
    const status = getEffectiveStatus(comp);
    groups[status].push(comp);
  }

  // Sort live competitions by end time (soonest first)
  groups.live.sort(
    (a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime()
  );

  // Sort voting competitions by voting end time
  groups.voting.sort(
    (a, b) =>
      new Date(a.voting_ends_at).getTime() - new Date(b.voting_ends_at).getTime()
  );

  // Sort completed by most recent first
  groups.completed.sort(
    (a, b) =>
      new Date(b.voting_ends_at).getTime() - new Date(a.voting_ends_at).getTime()
  );

  return groups;
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitionsWithCounts();
  const groups = groupCompetitionsByStatus(competitions);

  const defaultTab =
    groups.live.length > 0
      ? "live"
      : groups.voting.length > 0
      ? "voting"
      : groups.upcoming.length > 0
      ? "upcoming"
      : "all";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and join coding competitions
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All ({competitions.length})
          </TabsTrigger>
          <TabsTrigger value="live" disabled={groups.live.length === 0}>
            Live ({groups.live.length})
          </TabsTrigger>
          <TabsTrigger value="voting" disabled={groups.voting.length === 0}>
            Voting ({groups.voting.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" disabled={groups.upcoming.length === 0}>
            Upcoming ({groups.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed" disabled={groups.completed.length === 0}>
            Completed ({groups.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <CompetitionGrid competitions={competitions} />
        </TabsContent>

        <TabsContent value="live">
          <CompetitionGrid competitions={groups.live} />
        </TabsContent>

        <TabsContent value="voting">
          <CompetitionGrid competitions={groups.voting} />
        </TabsContent>

        <TabsContent value="upcoming">
          <CompetitionGrid competitions={groups.upcoming} />
        </TabsContent>

        <TabsContent value="completed">
          <CompetitionGrid competitions={groups.completed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CompetitionGrid({
  competitions,
}: {
  competitions: (Competition & { participant_count: number })[];
}) {
  if (competitions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No competitions found
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {competitions.map((competition) => (
        <CompetitionCard
          key={competition.id}
          competition={competition}
          participantCount={competition.participant_count}
        />
      ))}
    </div>
  );
}
