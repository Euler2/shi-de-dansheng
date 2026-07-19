const KEY = "shi-de-dansheng-v3-collection";

export type Seal = "none" | "silver" | "gold";

export interface LevelRecord {
  completedAt: string;
  seal: Seal;
  targetHits?: number;
  targetTotal?: number;
  plays: number;
}

export interface CollectionState {
  levels: Record<string, LevelRecord>;
  dailyCompleted: Record<string, string>;
  streak: number;
  lastDailyDate: string | null;
}

function empty(): CollectionState {
  return { levels: {}, dailyCompleted: {}, streak: 0, lastDailyDate: null };
}

export function loadCollection(): CollectionState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

function save(state: CollectionState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getSeal(levelId: string): Seal {
  return loadCollection().levels[levelId]?.seal ?? "none";
}

/** 揭晓后记录：首通银印；二周目全命中 isTarget 升金印 */
export function recordCompletion(
  levelId: string,
  targetHits: number,
  targetTotal: number,
  dailyDate?: string
): CollectionState {
  const state = loadCollection();
  const prev = state.levels[levelId];
  const plays = (prev?.plays ?? 0) + 1;

  let seal: Seal = prev?.seal ?? "none";
  if (plays === 1) seal = "silver";
  if (plays >= 2 && targetTotal > 0 && targetHits >= targetTotal) seal = "gold";
  if (seal === "silver" && targetTotal > 0 && targetHits >= targetTotal && plays >= 2)
    seal = "gold";

  state.levels[levelId] = {
    completedAt: new Date().toISOString(),
    seal,
    targetHits,
    targetTotal,
    plays,
  };

  if (dailyDate) {
    const wasYesterday =
      state.lastDailyDate &&
      dayDiff(state.lastDailyDate, dailyDate) === 1;
    const sameDay = state.lastDailyDate === dailyDate;
    if (!sameDay) {
      if (wasYesterday || !state.lastDailyDate) {
        state.streak = (state.streak || 0) + 1;
      } else if (dayDiff(state.lastDailyDate, dailyDate) > 1) {
        state.streak = 1;
      }
      state.lastDailyDate = dailyDate;
    }
    state.dailyCompleted[dailyDate] = levelId;
  }

  save(state);
  return state;
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + "T12:00:00");
  const db = new Date(b + "T12:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function countSeals(state = loadCollection()): { silver: number; gold: number } {
  let silver = 0;
  let gold = 0;
  for (const r of Object.values(state.levels)) {
    if (r.seal === "gold") gold++;
    else if (r.seal === "silver") silver++;
  }
  return { silver, gold };
}

export function isDailyDone(date: string): boolean {
  return !!loadCollection().dailyCompleted[date];
}
