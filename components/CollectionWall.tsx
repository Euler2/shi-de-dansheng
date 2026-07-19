"use client";

import { LEVELS } from "@/lib/levels";
import { countSeals, getSeal, loadCollection, type Seal } from "@/lib/collection";
import InkScene from "@/components/InkScene";

function SealMark({ seal }: { seal: Seal }) {
  if (seal === "none") return <span className="jian blank">笺</span>;
  return (
    <span className={`jian ${seal}`} title={seal === "gold" ? "金印·二周目全中" : "银印·首通"}>
      {seal === "gold" ? "金" : "银"}
    </span>
  );
}

export function CollectionWall({ onPick }: { onPick: (id: string) => void }) {
  const state = loadCollection();
  const { silver, gold } = countSeals(state);
  const sorted = [...LEVELS].sort((a, b) => a.title.localeCompare(b.title, "zh"));

  return (
    <section className="collection-wall">
      <p className="collection-intro">
        笺谱收集：首通得<strong>银印</strong>；同一篇再玩且句句命中真迹，升为<strong>金印</strong>（二周目）。
      </p>
      <p className="collection-stats">
        已收集 银印 {silver} · 金印 {gold} / 共 {sorted.length} 篇
      </p>
      <div className="jian-grid">
        {sorted.map((l) => {
          const seal = getSeal(l.id);
          const rec = state.levels[l.id];
          return (
            <button
              key={l.id}
              className={`jian-card ${seal}`}
              onClick={() => onPick(l.id)}
            >
              <InkScene seed={l.id} className="jian-art" />
              <SealMark seal={seal} />
              <span className="jian-title">{l.title}</span>
              <span className="jian-type">{l.type === "poem" ? "诗文" : "故事"}</span>
              {rec && (
                <span className="jian-plays">玩过 {rec.plays} 次</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
