// v2：在 v1 基础上增加 facets（非排他多维标签）与诗文逐句对照

export type LevelType = "poem" | "history";
export type StepKind = "compose" | "branch";
export type Tone = "cold" | "warm" | "bright" | "bleak" | "neutral";

/** 非排他标签：同一作品可同时属于多个维度 */
export interface LevelFacets {
  dynasty?: string[];
  author?: string[];
  form?: string[];
  storyKind?: string[];
  theme?: string[];
}

export interface Option {
  id: string;
  label: string;
  note?: string;
  fragment?: string;
  tone?: Tone;
  outcome?: string;
  feedback?: string;
  isTarget?: boolean;
  next?: string;
  /** 真迹选项：为什么用这一句 */
  whyHere?: string;
  /** 非真迹：若选此项，意味什么 */
  altNote?: string;
}

export interface WhatIf {
  teaser: string;
  alternateText: string;
  revealText: string;
}

export interface LineCompare {
  realLine: string;
  whyOriginal: string;
}

export interface Step {
  id: string;
  kind: StepKind;
  narration?: string;
  prompt: string;
  options: Option[];
  whatIf?: WhatIf;
  lineCompare?: LineCompare;
}

export interface ScoringBand {
  min: number;
  max: number;
  text: string;
}

export interface Scoring {
  mode: "resonance" | "fidelity";
  bands: ScoringBand[];
}

export interface Reveal {
  realText: string;
  source: string;
  analysis: string;
  takeaway: string;
}

export interface ShareCard {
  headline: string;
  footer: string;
}

export interface Level {
  id: string;
  type: LevelType;
  title: string;
  subtitle?: string;
  era: string;
  author: string;
  protagonist: string;
  difficulty?: 1 | 2 | 3;
  intro: string;
  guide?: string;
  steps: Step[];
  scoring: Scoring;
  reveal: Reveal;
  shareCard: ShareCard;
  tags?: string[];
  facets?: LevelFacets;
}

export type FacetDimension = "dynasty" | "author" | "form" | "storyKind" | "theme";

export const POEM_FACET_DIMS: FacetDimension[] = ["dynasty", "author", "form", "theme"];
export const STORY_FACET_DIMS: FacetDimension[] = ["dynasty", "storyKind", "theme"];

export const FACET_LABELS: Record<FacetDimension, string> = {
  dynasty: "朝代",
  author: "作者",
  form: "体裁",
  storyKind: "故事类型",
  theme: "主题",
};
