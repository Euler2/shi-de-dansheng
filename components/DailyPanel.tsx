"use client";

import type { Level } from "@/schema/level";
import { dateKey, getDailyHistoryLevel, getDailyPoemLevel } from "@/lib/daily";
import { getSeal, isDailyDone, loadCollection } from "@/lib/collection";
import InkScene from "@/components/InkScene";

export function DailyPanel({
  levels,
  onPlay,
}: {
  levels: Level[];
  onPlay: (id: string) => void;
}) {
  const today = dateKey();
  const dailyPoem = getDailyPoemLevel(levels);
  const dailyHistory = getDailyHistoryLevel(levels);
  const state = loadCollection();
  const done = isDailyDone(today);
  const poemSeal = getSeal(dailyPoem.id);
  const historySeal = dailyHistory ? getSeal(dailyHistory.id) : "none";
  const historyCount = levels.filter((l) => l.type === "history").length;

  return (
    <section className="daily-panel">
      <p className="daily-intro">
        诗与故事，同一应用 · 今日各推一篇 · 互动史共 {historyCount} 关
      </p>
      <div className="daily-duo">
        <article className="daily-card">
          <InkScene seed={dailyPoem.id} className="daily-art" />
          <div className="daily-meta">
            <span className="daily-tag">{today} · 今日诗篇</span>
            {state.streak > 0 && (
              <span className="daily-streak">连续 {state.streak} 天</span>
            )}
          </div>
          <h2 className="daily-title">{dailyPoem.title}</h2>
          <p className="daily-author">
            {dailyPoem.era} · {dailyPoem.author}
          </p>
          <p className="daily-sub">{dailyPoem.subtitle}</p>
          {poemSeal !== "none" && (
            <span className={`seal-badge ${poemSeal}`}>
              {poemSeal === "gold" ? "金印" : "银印"}
            </span>
          )}
          <button
            className="primary daily-btn"
            onClick={() => onPlay(dailyPoem.id)}
          >
            {done ? "再访今日诗" : "开始今日诗篇"}
          </button>
        </article>

        {dailyHistory && (
          <article className="daily-card daily-card--history">
            <InkScene seed={dailyHistory.id} className="daily-art" />
            <div className="daily-meta">
              <span className="daily-tag daily-tag--history">
                {today} · 今日故事
              </span>
            </div>
            <h2 className="daily-title">{dailyHistory.title}</h2>
            <p className="daily-author">
              {dailyHistory.era} · {dailyHistory.author}
            </p>
            <p className="daily-sub">{dailyHistory.subtitle}</p>
            {historySeal !== "none" && (
              <span className={`seal-badge ${historySeal}`}>
                {historySeal === "gold" ? "金印" : "银印"}
              </span>
            )}
            <button
              className="primary daily-btn"
              onClick={() => onPlay(dailyHistory.id)}
            >
              进入互动史
            </button>
          </article>
        )}
      </div>
      <p className="daily-hint">
        每日零点轮换；完成任意今日篇计入连续天数。浏览 → 故事，可玩全部互动史。
      </p>
    </section>
  );
}
