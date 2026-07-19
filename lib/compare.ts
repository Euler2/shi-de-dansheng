import type { Level, Option, Step } from "@/schema/level";

export interface LineDiff {
  stepId: string;
  prompt: string;
  yours: string;
  original: string;
  hit: boolean;
  note: string;
}

export function buildLineDiffs(
  level: Level,
  answers: Record<string, string>
): LineDiff[] {
  if (level.type !== "poem") return [];

  return level.steps
    .filter((s) => s.kind === "compose")
    .map((step) => {
      const chosen = pick(step, answers[step.id]);
      const target = step.options.find((o) => o.isTarget);
      const yours = chosen?.fragment || "（未选）";
      const original = target?.fragment || step.lineCompare?.realLine || "";
      const hit = !!chosen?.isTarget;

      let note = "";
      if (hit) {
        note = chosen?.whyHere || step.lineCompare?.whyOriginal || "与原作一致。";
      } else if (chosen && target) {
        note = `你写「${yours}」，${level.author}用「${original}」——${chosen.altNote || "意境略别，各有滋味。"}`;
      }

      return {
        stepId: step.id,
        prompt: step.prompt,
        yours,
        original,
        hit,
        note,
      };
    });
}

function pick(step: Step, optId?: string): Option | undefined {
  return step.options.find((o) => o.id === optId);
}
