"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Competition } from "@/types/database";
import {
  getEffectiveStatus,
  getStatusLabel,
  getStatusVariant,
} from "@/lib/utils/competition-state";
import { CompetitionTimer } from "./CompetitionTimer";

interface CompetitionCardProps {
  competition: Competition;
  participantCount?: number;
}

export function CompetitionCard({ competition, participantCount }: CompetitionCardProps) {
  const status = getEffectiveStatus(competition);

  return (
    <Link href={`/competitions/${competition.id}`}>
      <Card className="hover:border-foreground/20 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{competition.title}</CardTitle>
            <Badge variant={getStatusVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {competition.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <CompetitionTimer competition={competition} compact />
            {participantCount !== undefined && (
              <span className="text-muted-foreground">
                {participantCount} participant{participantCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
