import type { Level } from "@/schema/level";

/** 猜真句试点：从诗作 compose 步中抽真句与干扰项 */
export interface QuizQuestion {
  levelId: string;
  poemTitle: string;
  author: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pilotQuizLevels(levels: Level[]): Level[] {
  return levels.filter(
    (l) =>
      l.type === "poem" &&
      l.steps.filter((s) => s.kind === "compose").length >= 2
  );
}

export function buildQuizQuestion(level: Level): QuizQuestion | null {
  if (level.type !== "poem") return null;
  const steps = level.steps.filter((s) => s.kind === "compose");
  if (!steps.length) return null;

  const step = steps[Math.floor(Math.random() * steps.length)];
  const target = step.options.find((o) => o.isTarget);
  if (!target?.fragment) return null;

  const distractors = step.options
    .filter((o) => !o.isTarget && o.fragment)
    .map((o) => o.fragment as string);

  const pool = shuffle([
    target.fragment,
    ...distractors,
    ...collectOtherFragments(level, step.id),
  ]);
  const unique = [...new Set(pool)].slice(0, 4);
  if (!unique.includes(target.fragment)) unique[0] = target.fragment;
  const choices = shuffle(unique.slice(0, Math.min(4, unique.length)));

  return {
    levelId: level.id,
    poemTitle: level.title,
    author: level.author,
    prompt: `《${level.title}》中，「${step.prompt}」——哪一句是真迹？`,
    choices,
    answerIndex: choices.indexOf(target.fragment),
  };
}

function collectOtherFragments(level: Level, skipStepId: string): string[] {
  const out: string[] = [];
  for (const s of level.steps) {
    if (s.id === skipStepId) continue;
    for (const o of s.options) {
      if (o.fragment && !o.isTarget) out.push(o.fragment);
    }
  }
  return out;
}
