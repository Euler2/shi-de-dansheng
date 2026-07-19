/**
 * 从 v1 JSON 注入 v2 字段：facets（非排他多维标签）+ 诗文选项对照说法
 * 运行：node scripts/enrich-levels.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEVELS_DIR = path.join(__dirname, "../data/levels");

/** 每关的非排他标签（可交叉：一首唐诗五言绝句同时有 唐+李白+五言绝句） */
const FACETS = {
  "tianjingsha-qiusi": { dynasty: ["元"], author: ["马致远"], form: ["曲"], theme: ["秋思", "羁旅"] },
  jingyesi: { dynasty: ["唐"], author: ["李白"], form: ["五言绝句"], theme: ["思乡", "月夜"] },
  denguequelou: { dynasty: ["唐"], author: ["王之涣"], form: ["五言绝句"], theme: ["登高", "壮志"] },
  jiangxue: { dynasty: ["唐"], author: ["柳宗元"], form: ["五言绝句"], theme: ["孤寂", "山水"] },
  "yi-shandong-xiongdi": { dynasty: ["唐"], author: ["王维"], form: ["七言绝句"], theme: ["思乡", "重阳"] },
  rumengling: { dynasty: ["宋"], author: ["李清照"], form: ["词"], theme: ["婉约", "闲情"] },
  chunxiao: { dynasty: ["唐"], author: ["孟浩然"], form: ["五言绝句"], theme: ["春景", "闲适"] },
  "wang-lushan-pubu": { dynasty: ["唐"], author: ["李白"], form: ["七言绝句"], theme: ["山水", "想象"] },
  qingming: { dynasty: ["唐"], author: ["杜牧"], form: ["七言绝句"], theme: ["清明", "愁思"] },
  "liangzhou-ci": { dynasty: ["唐"], author: ["王翰"], form: ["七言绝句"], theme: ["边塞", "豪放"] },
  "ti-xilin-bi": { dynasty: ["宋"], author: ["苏轼"], form: ["七言绝句"], theme: ["哲理", "山水"] },
  chunwang: { dynasty: ["唐"], author: ["杜甫"], form: ["五言律诗"], theme: ["家国", "乱世"] },
  "jingke-cike": { dynasty: ["战国"], storyKind: ["正史", "侠义"], theme: ["抉择", "刺客"] },
  hongmenyan: { dynasty: ["秦末"], storyKind: ["正史", "楚汉"], theme: ["性格", "权谋"] },
  "suwu-muyang": { dynasty: ["汉"], storyKind: ["正史", "气节"], theme: ["坚守", "使节"] },
  "quyuan-toujiang": { dynasty: ["战国"], storyKind: ["正史", "爱国"], theme: ["屈原", "汨罗"] },
  "woxin-changdan": { dynasty: ["春秋"], storyKind: ["正史", "成语故事"], theme: ["隐忍", "复国"] },
  "wanbi-guizhao": { dynasty: ["战国"], storyKind: ["正史", "成语故事"], theme: ["智勇", "外交"] },
  "shangyang-limu": { dynasty: ["战国"], storyKind: ["正史", "变法"], theme: ["诚信", "制度"] },
  "wentianxiang-jiuyi": { dynasty: ["宋末"], storyKind: ["正史", "气节"], theme: ["忠义", "南宋"] },
};

const DEFAULT_POEM_WHY = "这一句在声韵、意象或章法上更贴合作者当时的心绪与流传本。";
const DEFAULT_POEM_ALT = "这样写也成一首完整的诗，只是意境与名作略别。";

/** 部分名篇的逐句说法（可逐步补全） */
const LINE_NOTES = {
  jingyesi: {
    s1: {
      a: "月光清冷、普及，不挑贫富，最宜写客中清夜。",
      b: "残烛虽可写夜，却少了月与故乡的经典联想。",
      c: "疏影太幽，不如月光直陈来得明白。",
    },
    s2: {
      a: "「霜」字寒而洁，把月光写得可触，且暗合秋夜。",
      b: "雪意过重，与后文举头望月、思乡的节奏略滞。",
      c: "水凉之喻稍远，不如霜贴近地面所见。",
    },
    s3: {
      a: "明月是此诗的枢纽，后文低头思故乡皆由此生发。",
      b: "夜色太泛，少了那一点可凝视的寄托。",
      c: "天际辽远，却不如一轮明月更能勾连故乡。",
    },
    s4: {
      a: "「故乡」二字直抵人心，千古共鸣由此而来。",
      b: "叹飘零是愁，却不如故乡二字宽而深。",
      c: "数归期是事，不如思乡是情，更耐回味。",
    },
  },
};

for (const file of fs.readdirSync(LEVELS_DIR).filter((f) => f.endsWith(".json"))) {
  const p = path.join(LEVELS_DIR, file);
  const level = JSON.parse(fs.readFileSync(p, "utf8"));
  const facets = FACETS[level.id];
  if (facets) level.facets = facets;

  if (level.type === "poem") {
    for (const step of level.steps) {
      if (step.kind !== "compose") continue;
      const target = step.options.find((o) => o.isTarget);
      for (const opt of step.options) {
        const custom = LINE_NOTES[level.id]?.[step.id]?.[opt.id];
        if (opt.isTarget) {
          opt.whyHere = custom || opt.feedback || DEFAULT_POEM_WHY;
        } else {
          opt.altNote = custom || opt.feedback || DEFAULT_POEM_ALT;
        }
      }
      if (target && !step.lineCompare) {
        step.lineCompare = {
          realLine: target.fragment || "",
          whyOriginal: target.whyHere || DEFAULT_POEM_WHY,
        };
      }
    }
  }

  fs.writeFileSync(p, JSON.stringify(level, null, 2) + "\n", "utf8");
  console.log("enriched:", level.id);
}
