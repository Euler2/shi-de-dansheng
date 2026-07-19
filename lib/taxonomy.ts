import type { FacetDimension, Level, LevelFacets, LevelType } from "@/schema/level";
import { FACET_LABELS, POEM_FACET_DIMS, STORY_FACET_DIMS } from "@/schema/level";

export type FacetFilters = Partial<Record<FacetDimension, string[]>>;

export function getFacetValues(
  levels: Level[],
  type: LevelType,
  dimension: FacetDimension
): string[] {
  const set = new Set<string>();
  for (const l of levels) {
    if (l.type !== type) continue;
    const arr = l.facets?.[dimension];
    if (arr) arr.forEach((v) => set.add(v));
  }
  return [...set].sort((a, b) => a.localeCompare(b, "zh"));
}

export function filterLevels(
  levels: Level[],
  type: LevelType,
  filters: FacetFilters
): Level[] {
  return levels.filter((l) => {
    if (l.type !== type) return false;
    return matchesFacets(l.facets, filters);
  });
}

/** 同一维度内 OR，不同维度间 AND；未选维度不限制 */
export function matchesFacets(
  facets: LevelFacets | undefined,
  filters: FacetFilters
): boolean {
  if (!facets) return Object.values(filters).every((v) => !v?.length);
  for (const [dim, selected] of Object.entries(filters) as [
    FacetDimension,
    string[] | undefined,
  ][]) {
    if (!selected?.length) continue;
    const onLevel = facets[dim] || [];
    if (!selected.some((s) => onLevel.includes(s))) return false;
  }
  return true;
}

export function toggleFilter(
  filters: FacetFilters,
  dimension: FacetDimension,
  value: string
): FacetFilters {
  const next = { ...filters };
  const cur = [...(next[dimension] || [])];
  const i = cur.indexOf(value);
  if (i >= 0) cur.splice(i, 1);
  else cur.push(value);
  if (cur.length) next[dimension] = cur;
  else delete next[dimension];
  return next;
}

export function clearFilters(): FacetFilters {
  return {};
}

export function dimsForType(type: LevelType): FacetDimension[] {
  return type === "poem" ? POEM_FACET_DIMS : STORY_FACET_DIMS;
}

export { FACET_LABELS };
