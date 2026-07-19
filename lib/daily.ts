import type { Level } from "@/schema/level";

const EPOCH = new Date("2025-06-01T00:00:00+08:00").getTime();

export function dayIndex(d = new Date()): number {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((local.getTime() - EPOCH) / 86_400_000);
}

export function dateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 每日一篇：在全部关卡中按日轮转 */
export function getDailyLevel(levels: Level[], d = new Date()): Level {
  const idx = dayIndex(d);
  const sorted = [...levels].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[((idx % sorted.length) + sorted.length) % sorted.length];
}

/** 每日故事：在互动史关卡中按日轮转 */
export function getDailyHistoryLevel(levels: Level[], d = new Date()): Level | null {
  const history = levels
    .filter((l) => l.type === "history")
    .sort((a, b) => a.id.localeCompare(b.id));
  if (!history.length) return null;
  const idx = dayIndex(d);
  return history[((idx % history.length) + history.length) % history.length];
}

/** 每日诗篇：在诗词关卡中按日轮转（偏移一日，避免与故事同日重复感） */
export function getDailyPoemLevel(levels: Level[], d = new Date()): Level {
  const poems = levels
    .filter((l) => l.type === "poem")
    .sort((a, b) => a.id.localeCompare(b.id));
  if (!poems.length) return getDailyLevel(levels, d);
  const idx = dayIndex(d) + 17;
  return poems[((idx % poems.length) + poems.length) % poems.length];
}

export function isTodayDaily(levelId: string, levels: Level[], d = new Date()): boolean {
  return getDailyLevel(levels, d).id === levelId;
}
