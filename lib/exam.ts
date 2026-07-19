import examLists from "@/data/exam-lists.json";
import examMap from "@/data/exam-map.json";
import juniorProse from "@/data/scaffold/stories-junior-prose.json";
import seniorProse from "@/data/scaffold/stories-senior-prose.json";
import { LEVELS } from "@/lib/levels";
import type { Level } from "@/schema/level";

export type ExamTrack = "primary75" | "junior60" | "senior72";

export interface ExamItemView {
  no: number;
  title: string;
  author?: string;
  kind?: string;
  tier?: string;
  levelId?: string;
  playable: boolean;
}

const titleToLevel = new Map<string, string>();

for (const [levelId, meta] of Object.entries(examMap.byLevelId)) {
  const m = meta as { titles: string[] };
  for (const t of m.titles) titleToLevel.set(normalizeTitle(t), levelId);
}

for (const lv of LEVELS) {
  titleToLevel.set(normalizeTitle(lv.title), lv.id);
}

for (const item of [...juniorProse, ...seniorProse]) {
  if (item.levelId) titleToLevel.set(normalizeTitle(item.title), item.levelId);
}

function normalizeTitle(t: string): string {
  return t
    .replace(/[《》「」·…—\s]/g, "")
    .replace(/（.*?）/g, "")
    .replace(/\(.*?\)/g, "")
    .toLowerCase();
}

function resolveLevelId(title: string): string | undefined {
  const n = normalizeTitle(title);
  if (titleToLevel.has(n)) return titleToLevel.get(n);
  for (const lv of LEVELS) {
    if (normalizeTitle(lv.title).includes(n) || n.includes(normalizeTitle(lv.title)))
      return lv.id;
  }
  return undefined;
}

export function getExamMeta() {
  return examLists.meta;
}

export function getExamSources() {
  return examLists.sources;
}

export function listExamItems(track: ExamTrack): ExamItemView[] {
  if (track === "senior72") {
    const prose = examLists.senior72.prose32.map((it) => ({
      ...it,
      kind: "文言",
      levelId: resolveLevelId(it.title),
      playable: !!resolveLevelId(it.title),
    }));
    const poetry = examLists.senior72.poetry40.map((it) => ({
      ...it,
      kind: "诗词曲",
      levelId: resolveLevelId(it.title),
      playable: !!resolveLevelId(it.title),
    }));
    return [...prose, ...poetry] as ExamItemView[];
  }

  const block = track === "primary75" ? examLists.primary75 : examLists.junior60;
  return block.items.map((it) => {
    const levelId = resolveLevelId(it.title);
    return {
      ...it,
      levelId,
      playable: !!levelId,
    };
  });
}

export function examTrackLabel(track: ExamTrack): string {
  if (track === "primary75") return examLists.primary75.label;
  if (track === "junior60") return examLists.junior60.label;
  return examLists.senior72.label;
}

export function examTrackAlias(track: ExamTrack): string {
  if (track === "primary75") return examLists.primary75.alias;
  if (track === "junior60") return examLists.junior60.alias;
  return examLists.senior72.alias;
}

export function playableInTrack(track: ExamTrack): Level[] {
  const ids = new Set(
    listExamItems(track)
      .filter((i) => i.playable && i.levelId)
      .map((i) => i.levelId as string)
  );
  return LEVELS.filter((l) => ids.has(l.id));
}

export function countPlayable(track: ExamTrack): { total: number; playable: number } {
  const items = listExamItems(track);
  return {
    total: items.length,
    playable: items.filter((i) => i.playable).length,
  };
}
