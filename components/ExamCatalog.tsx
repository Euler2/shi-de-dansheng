"use client";

import { useMemo, useState } from "react";
import {
  countPlayable,
  examTrackAlias,
  examTrackLabel,
  getExamSources,
  listExamItems,
  type ExamTrack,
} from "@/lib/exam";

export function ExamCatalog({ onPlay }: { onPlay: (levelId: string) => void }) {
  const [track, setTrack] = useState<ExamTrack>("primary75");
  const sources = getExamSources();
  const items = useMemo(() => listExamItems(track), [track]);
  const stats = countPlayable(track);

  return (
    <section className="exam-catalog">
      <p className="exam-note">
        以下目录摘自教育部课标附录原文，非民间整理的「必考卷」。
        {examTrackAlias(track)}
      </p>

      <div className="exam-tabs">
        <button
          className={track === "primary75" ? "tab on" : "tab"}
          onClick={() => setTrack("primary75")}
        >
          小学 75 篇
        </button>
        <button
          className={track === "junior60" ? "tab on" : "tab"}
          onClick={() => setTrack("junior60")}
        >
          初中 60 篇
        </button>
        <button
          className={track === "senior72" ? "tab on" : "tab"}
          onClick={() => setTrack("senior72")}
        >
          高中 72 篇
        </button>
      </div>

      <h3 className="exam-heading">{examTrackLabel(track)}</h3>
      <p className="exam-stats">
        互动已收录 {stats.playable} / {stats.total} 篇（其余为目录，待扩充关卡）
      </p>

      <ul className="exam-list">
        {items.map((it) => (
          <li key={`${track}-${it.no}-${it.title}`} className="exam-row">
            <span className="exam-no">{it.no}</span>
            <span className="exam-title">{it.title}</span>
            {it.author && <span className="exam-author">{it.author}</span>}
            {it.tier && <span className="exam-tier">{it.tier}</span>}
            {it.playable && it.levelId ? (
              <button
                className="exam-play"
                onClick={() => onPlay(it.levelId!)}
              >
                去玩
              </button>
            ) : (
              <span className="exam-soon">目录</span>
            )}
          </li>
        ))}
      </ul>

      <details className="exam-sources">
        <summary>权威出处</summary>
        <ul>
          <li>
            义务教育 135 篇：{sources.compulsory.title}（共{" "}
            {sources.compulsory.total} 篇，小学 {sources.compulsory.primary} + 初中{" "}
            {sources.compulsory.junior}）
          </li>
          <li>
            高中 72 篇：{sources.senior.title}（文言文{" "}
            {sources.senior.prose} + 诗词曲 {sources.senior.poetry}；高考默写常考约{" "}
            {sources.senior.gaokaoOften} 篇）
          </li>
        </ul>
      </details>
    </section>
  );
}
