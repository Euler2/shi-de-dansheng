/**
 * 批量生成课标诗文的 2 步互动关（首句 + 次句），并 regenerate lib/levels.ts
 * 运行：node scripts/scaffold-poems.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LEVELS_DIR = path.join(ROOT, "data/levels");

const SKIP = new Set([
  "jingyesi",
  "chunxiao",
  "denguequelou",
  "jiangxue",
  "yi-shandong-xiongdi",
  "wang-lushan-pubu",
  "qingming",
  "liangzhou-ci",
  "ti-xilin-bi",
  "minong",
  "yonge",
  "chunwang",
  "tianjingsha-qiusi",
  "rumengling",
]);

const EXISTING = new Set(
  fs.existsSync(LEVELS_DIR)
    ? fs.readdirSync(LEVELS_DIR).map((f) => f.replace(/\.json$/, ""))
    : []
);

function slug(id) {
  return id.replace(/[^a-z0-9-]/gi, "");
}

function altLine(line) {
  if (line.length < 4) return line + "（另写）";
  const mid = Math.floor(line.length / 2);
  return line.slice(0, mid) + "…" + line.slice(mid + 1);
}

function altLine2(line) {
  return "且向" + line.slice(0, Math.min(4, line.length)) + "外";
}

function makeLevel(poem) {
  const id = slug(poem.id);
  if (SKIP.has(id) || EXISTING.has(id)) return null;

  const lines = poem.lines.filter(Boolean);
  if (lines.length < 2) return null;

  const L0 = lines[0];
  const L1 = lines[1];
  const realText = lines.join("");

  const steps = [
    {
      id: "s1",
      kind: "compose",
      narration: `你想写《${poem.title}》，先定下起句——`,
      prompt: "起句怎么写",
      options: [
        {
          id: "a",
          label: L0.length > 12 ? L0.slice(0, 12) + "…" : L0,
          fragment: L0,
          isTarget: true,
          whyHere: "与流传本起句一致，便于与后文章法相承。",
        },
        {
          id: "b",
          label: altLine(L0).slice(0, 14),
          fragment: altLine(L0),
          altNote: "意境可通，但与名篇起句不同，读感略别。",
        },
        {
          id: "c",
          label: altLine2(L0).slice(0, 14),
          fragment: altLine2(L0),
          altNote: "另起炉灶，亦成一句，只是非此作经典开篇。",
        },
      ],
      lineCompare: { realLine: L0, whyOriginal: "课标与通行本以此起句开篇。" },
    },
    {
      id: "s2",
      kind: "compose",
      narration: "承上句，接着写——",
      prompt: "第二句",
      options: [
        {
          id: "a",
          label: L1.length > 12 ? L1.slice(0, 12) + "…" : L1,
          fragment: L1,
          isTarget: true,
          whyHere: "承接起句，是通行本第二句。",
        },
        {
          id: "b",
          label: altLine(L1).slice(0, 14),
          fragment: altLine(L1),
          altNote: "可成对句，但与原作次句不同。",
        },
        {
          id: "c",
          label: "换一意境收束",
          fragment: altLine2(L1),
          altNote: "另写收束，全篇风味随之而变。",
        },
      ],
      lineCompare: { realLine: L1, whyOriginal: "名篇次句，与起句相配。" },
    },
  ];

  return {
    id,
    type: "poem",
    title: poem.title,
    subtitle: poem.theme?.[0] ? `${poem.theme[0]} · 课标背诵篇` : "课标背诵篇",
    era: poem.era,
    author: poem.author,
    protagonist: `面对景与情，拟写《${poem.title}》的诗人`,
    difficulty: 1,
    intro: `课标篇目《${poem.title}》（${poem.author}）。你从眼前景或心中情起笔——`,
    steps,
    scoring: {
      mode: "resonance",
      bands: [
        { min: 2, max: 2, text: "与原作同工——名篇筋骨已在。" },
        { min: 1, max: 1, text: "一句相合，一句别创，亦有趣味。" },
        { min: 0, max: 0, text: "另写一路，对照真迹当别有会心。" },
      ],
    },
    reveal: {
      realText,
      source: `${poem.author}《${poem.title}》`,
      analysis: `义务教育/高中课标推荐背诵篇目。全诗意境可从此两句窥见一斑。`,
      takeaway: "熟读后，不妨闭目击节，体会为何千年流传。",
    },
    shareCard: { headline: poem.title, footer: "诗的诞生" },
    facets: {
      dynasty: [poem.era],
      author: [poem.author.replace(/《|》/g, "")],
      form: poem.form ? [poem.form] : ["诗"],
      theme: poem.theme || ["课标"],
    },
  };
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

let created = 0;
for (const file of ["poems-primary.json", "poems-junior.json", "poems-senior.json"]) {
  const poems = loadJson(path.join(ROOT, "data/scaffold", file));
  for (const poem of poems) {
    const level = makeLevel(poem);
    if (!level) continue;
    const out = path.join(LEVELS_DIR, `${level.id}.json`);
    fs.writeFileSync(out, JSON.stringify(level, null, 2) + "\n", "utf8");
    EXISTING.add(level.id);
    created++;
  }
}

// regenerate levels.ts
const ids = fs
  .readdirSync(LEVELS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .sort((a, b) => a.localeCompare(b));

const imports = ids
  .map((id) => `import ${toVar(id)} from "@/data/levels/${id}.json";`)
  .join("\n");
const arr = ids.map((id) => `  ${toVar(id)},`).join("\n");

const levelsTs = `import type { Level } from "@/schema/level";
${imports}

export const LEVELS: Level[] = [
${arr}
] as unknown as Level[];

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
`;

fs.writeFileSync(path.join(ROOT, "lib/levels.ts"), levelsTs, "utf8");
console.log(`Created ${created} levels. Total: ${ids.length}. Updated lib/levels.ts`);

function toVar(id) {
  const v = id.replace(/[^a-zA-Z0-9]/g, "_");
  return /^\d/.test(v) ? `_${v}` : v;
}
