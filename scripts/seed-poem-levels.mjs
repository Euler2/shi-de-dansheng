/**
 * 按 scaffold 规律批量补诗文关卡：
 * - 2 步 compose
 * - 每步 2～3 选，1 个 isTarget
 * - facets: dynasty / author / form / theme
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "data", "levels");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function exists(id) {
  return fs.existsSync(path.join(outDir, `${id}.json`));
}

function poemLevel(spec) {
  const [line1, line2] = spec.lines;
  const wrong1 = spec.wrong1 ?? line1.slice(0, 2) + "……" + line1.slice(-2);
  const wrong2 = spec.wrong2 ?? line2.slice(0, 2) + "……";

  return {
    id: spec.id,
    type: "poem",
    title: spec.title,
    subtitle: spec.subtitle ?? `${spec.form} · 课标背诵`,
    era: spec.era,
    author: spec.author,
    protagonist: spec.protagonist ?? `拟写《${spec.title}》的诗人`,
    difficulty: 1,
    intro: spec.intro ?? `课标篇目《${spec.title}》（${spec.author}）。你从眼前景或心中情起笔——`,
    guide: "你将一步步写下这一篇。选对更接近流传名篇。",
    steps: [
      {
        id: "s1",
        kind: "compose",
        narration: spec.n1 ?? "你先定下起句——",
        prompt: "选起句方向",
        options: [
          {
            id: "a",
            label: spec.l1a ?? line1.slice(0, 8),
            fragment: line1,
            isTarget: true,
            whyHere: "与课标通行本、声情相合。",
          },
          {
            id: "b",
            label: spec.l1b ?? "另起意境",
            fragment: wrong1,
            altNote: "意境可通，但与通行本不同。",
          },
        ],
        lineCompare: { realLine: line1, whyOriginal: "起句定调，名篇多由此出。" },
      },
      {
        id: "s2",
        kind: "compose",
        narration: spec.n2 ?? "再写下一句——",
        prompt: "接下一句",
        options: [
          {
            id: "a",
            label: spec.l2a ?? line2.slice(0, 8),
            fragment: line2,
            isTarget: true,
            whyHere: "与上句相承，合于名篇。",
          },
          {
            id: "b",
            label: spec.l2b ?? "换另一种收束",
            fragment: wrong2,
            altNote: "可成句，但与名篇不同。",
          },
        ],
        lineCompare: { realLine: line2, whyOriginal: "承转之间，见作者匠心。" },
      },
    ],
    scoring: {
      mode: "resonance",
      bands: [
        { min: 0, max: 1, text: "你的版本有情致，与名篇略异。" },
        { min: 2, max: 2, text: "你写成了通行名篇的关键句。" },
      ],
    },
    reveal: {
      realText: spec.realText ?? `${line1}${line2 ? "，" + line2 : ""}。`,
      source: spec.source ?? `${spec.author}《${spec.title}》`,
      analysis: spec.analysis ?? `《${spec.title}》为课标篇目，${spec.form}，主题：${(spec.theme || []).join("、")}。`,
      takeaway: spec.takeaway ?? `名篇在字句之间，多读多比，方知「为什么说」。`,
    },
    shareCard: {
      headline: `${spec.title} · 你拼出的版本`,
      footer: spec.takeaway ?? "多读多比，方知为什么说。",
    },
    tags: [spec.era, spec.form, ...(spec.theme || [])],
    facets: {
      dynasty: [spec.era.replace(/末$/, "").replace(/^北朝$/, "北朝")],
      author: [spec.author.replace(/《|》/g, "")],
      form: [spec.form],
      theme: spec.theme || [],
    },
  };
}

const scaffoldFiles = [
  "data/scaffold/poems-primary.json",
  "data/scaffold/poems-junior.json",
  "data/scaffold/poems-senior.json",
  "data/scaffold/poems-extra.json",
];

const newIds = [];
for (const rel of scaffoldFiles) {
  const list = readJson(path.join(root, rel));
  for (const item of list) {
    if (exists(item.id)) continue;
    const data = poemLevel(item);
    fs.writeFileSync(
      path.join(outDir, `${item.id}.json`),
      JSON.stringify(data, null, 2) + "\n",
      "utf8"
    );
    newIds.push(item.id);
    console.log("poem", item.id, item.title);
  }
}

if (newIds.length) {
  const levelsTs = path.join(root, "lib", "levels.ts");
  let src = fs.readFileSync(levelsTs, "utf8");
  const missing = newIds.filter((id) => !src.includes(`@/data/levels/${id}.json`));
  if (missing.length) {
    const importBlock = missing
      .map((id) => {
        const importName = id.replace(/-/g, "_");
        return `import ${importName} from "@/data/levels/${id}.json";`;
      })
      .join("\n");
    src = src.replace(
      /\nexport const LEVELS: Level\[\] = \[/,
      `\n${importBlock}\n\nexport const LEVELS: Level[] = [`
    );
  }
  const arrayBlock = newIds
    .filter((id) => !src.includes(`  ${id.replace(/-/g, "_")},`))
    .map((id) => `  ${id.replace(/-/g, "_")},`)
    .join("\n");
  if (arrayBlock) {
    src = src.replace(
      /(\n] as unknown as Level\[\];)/,
      `\n${arrayBlock}$1`
    );
  }
  fs.writeFileSync(levelsTs, src, "utf8");
}

console.log("new poem levels:", newIds.length);
