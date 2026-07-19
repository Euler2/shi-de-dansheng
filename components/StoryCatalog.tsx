"use client";

import { useMemo, useState } from "react";
import juniorStories from "@/data/scaffold/stories-junior-prose.json";
import seniorStories from "@/data/scaffold/stories-senior-prose.json";
import { dayIndex } from "@/lib/daily";
import { LEVELS } from "@/lib/levels";
import InkScene from "@/components/InkScene";

type StoryTrack = "junior" | "senior";

interface StoryItem {
  no: number;
  title: string;
  author: string;
  era: string;
  summary: string;
  levelId?: string | null;
  tier?: string;
  gaokaoOften?: boolean;
  relatedLevelId?: string;
}

function resolvePlayId(
  item: StoryItem,
  historyIds: Set<string>
): string | null {
  if (item.levelId && historyIds.has(item.levelId)) return item.levelId;
  if (item.relatedLevelId && historyIds.has(item.relatedLevelId)) {
    return item.relatedLevelId;
  }
  return null;
}

export function StoryCatalog({ onPlay }: { onPlay: (levelId: string) => void }) {
  const [track, setTrack] = useState<StoryTrack>("junior");
  const historyLevels = LEVELS.filter((l) => l.type === "history");
  const historyIds = new Set(historyLevels.map((l) => l.id));

  const stories: StoryItem[] =
    track === "junior" ? juniorStories : seniorStories;

  const playableInTrack = stories.filter((s) =>
    resolvePlayId(s, historyIds)
  ).length;

  const featured = useMemo(() => {
    const sorted = [...historyLevels].sort((a, b) =>
      a.id.localeCompare(b.id)
    );
    const start = dayIndex() % sorted.length;
    return [...sorted.slice(start), ...sorted.slice(0, start)].slice(0, 6);
  }, [historyLevels.length]);

  return (
    <section className="story-catalog">
      <header className="story-hero">
        <h2 className="story-hero-title">互动史 · 课标文言 + 经典正史</h2>
        <p className="story-hero-note">
          共 {historyLevels.length} 篇可玩互动 ·{" "}
          {track === "junior" ? "初中" : "高中"} {playableInTrack}/{stories.length}{" "}
          篇已对接课标目录
        </p>
      </header>

      <div className="story-featured">
        <p className="facet-dim">今日推荐 · 六则历史路口</p>
        <div className="story-featured-grid">
          {featured.map((l) => (
            <button
              key={l.id}
              className="story-featured-card"
              onClick={() => onPlay(l.id)}
            >
              <InkScene seed={l.id} className="story-featured-art" />
              <span className="lv-era">{l.era}</span>
              <span className="lv-title">{l.title}</span>
              <span className="lv-sub">{l.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="exam-tabs">
        <button
          className={track === "junior" ? "tab on" : "tab"}
          onClick={() => setTrack("junior")}
        >
          初中文言 20 篇
        </button>
        <button
          className={track === "senior" ? "tab on" : "tab"}
          onClick={() => setTrack("senior")}
        >
          高中文言 32 篇
        </button>
      </div>

      <p className="exam-note">
        {track === "junior"
          ? "摘自义务教育课标（2022）7～9 年级背诵篇目第 41～60 条。"
          : "摘自高中课标（2017）古诗文背诵推荐篇目中文言 32 篇；标注「常考」者多为必修+选择性必修（约 20 篇高考默写常见）。"}
      </p>

      <div className="story-grid">
        {stories.map((s) => {
          const direct = resolvePlayId(s, historyIds);

          const related = LEVELS.filter(
            (l) =>
              l.type === "history" &&
              !direct &&
              (l.title.includes(s.title.replace(/《|》/g, "").slice(0, 2)) ||
                s.summary.includes(l.author))
          );

          return (
            <article key={`${track}-${s.no}`} className="story-card">
              <span className="story-no">{s.no}</span>
              {s.tier && <span className="exam-tier">{s.tier}</span>}
              {s.gaokaoOften === false && (
                <span className="exam-soon">选修·少考</span>
              )}
              {s.gaokaoOften && track === "senior" && (
                <span className="exam-tier">常考</span>
              )}
              <h3 className="story-title">{s.title}</h3>
              <p className="story-meta">
                {s.era} · {s.author}
              </p>
              <p className="story-summary">{s.summary}</p>
              {direct ? (
                <button className="exam-play" onClick={() => onPlay(direct)}>
                  去玩互动关
                </button>
              ) : related.length > 0 ? (
                <div className="story-related">
                  {related.map((l) => (
                    <button
                      key={l.id}
                      className="exam-play"
                      onClick={() => onPlay(l.id)}
                    >
                      相关：{l.title}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="exam-soon">互动待扩充</span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
