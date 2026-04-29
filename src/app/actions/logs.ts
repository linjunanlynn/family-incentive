"use server";

import { prisma } from "@/lib/prisma";
import { localDateKeyToUtcMidnight } from "@/lib/utils";
import { assertCanScore } from "@/lib/guard";
import { revalidatePath } from "next/cache";

export async function logBehaviorAction(input: {
  childId: string;
  behaviorId: string;
  dateKey: string; // YYYY-MM-DD local
  notes?: string;
  occurrences?: number;
}) {
  const behavior = await prisma.behavior.findUnique({
    where: { id: input.behaviorId },
    select: { id: true, type: true, points: true, categoryId: true, archived: true },
  });
  if (!behavior || behavior.archived) {
    return { ok: false as const, error: "behavior_unavailable" };
  }

  const scorer = await assertCanScore();
  if (!scorer) {
    return { ok: false as const, error: "forbidden" as const };
  }
  const operatorId = scorer.memberId;
  const day = localDateKeyToUtcMidnight(input.dateKey);
  const existing = await prisma.logEntry.findFirst({
    where: { childId: input.childId, behaviorId: behavior.id, date: day },
    select: { id: true },
  });
  if (existing) {
    return { ok: false as const, error: "already_logged" as const };
  }

  const occurrences = 1;
  const signedPoints =
    behavior.type === "positive" ? behavior.points : -behavior.points;

  const entry = await prisma.logEntry.create({
    data: {
      childId: input.childId,
      behaviorId: behavior.id,
      type: behavior.type,
      points: signedPoints,
      occurrences,
      date: day,
      notes: input.notes?.trim() || null,
      createdById: operatorId,
    },
  });

  revalidatePath("/", "layout");
  return { ok: true as const, id: entry.id, points: signedPoints * occurrences };
}

export async function deleteLogAction(id: string) {
  const scorer = await assertCanScore();
  if (!scorer) return { ok: false as const };
  await prisma.logEntry.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}


export async function updateLogOccurrencesAction(id: string, occurrences: number) {
  const scorer = await assertCanScore();
  if (!scorer) return { ok: false as const };
  const log = await prisma.logEntry.findUnique({
    where: { id },
    select: { id: true, points: true, type: true },
  });
  if (!log) return { ok: false as const };
  const occ = Math.max(1, Math.min(20, occurrences));
  await prisma.logEntry.update({
    where: { id },
    data: { occurrences: occ },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
