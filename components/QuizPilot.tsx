"use client";

import { useMemo, useState } from "react";
import type { Level } from "@/schema/level";
import {
  buildQuizQuestion,
  pilotQuizLevels,
  type QuizQuestion,
} from "@/lib/quiz";

export function QuizPilot({
  levels,
  onOpenLevel,
}: {
  levels: Level[];
  onOpenLevel: (id: string) => void;
}) {
  const pool = useMemo(() => pilotQuizLevels(levels), [levels]);
  const [q, setQ] = useState<QuizQuestion | null>(() =>
    pool.length ? buildQuizQuestion(pool[0]) : null
  );
  const [picked, setPicked] = useState<number | null>(null);

  function next() {
    if (!pool.length) return;
    const lv = pool[Math.floor(Math.random() * pool.length)];
    setQ(buildQuizQuestion(lv));
    setPicked(null);
  }

  if (!pool.length || !q) {
    return <p className="facet-hint">猜真句试点：暂无可用诗作。</p>;
  }

  const correct = picked !== null && picked === q.answerIndex;

  return (
    <section className="quiz-pilot">
      <p className="quiz-intro">
        <span className="pilot-tag">试点</span>
        从已收录名篇的真迹与干扰句中，辨认哪一句是原作。
      </p>
      <p className="quiz-prompt">{q.prompt}</p>
      <div className="quiz-choices">
        {q.choices.map((c, i) => {
          let cls = "quiz-choice";
          if (picked !== null) {
            if (i === q.answerIndex) cls += " right";
            else if (i === picked) cls += " wrong";
          }
          return (
            <button
              key={c}
              className={cls}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
            >
              {c}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="quiz-result">
          <p>{correct ? "正是此句。" : `原作是：${q.choices[q.answerIndex]}`}</p>
          <div className="quiz-actions">
            <button className="primary" onClick={next}>
              再来一题
            </button>
            <button className="export" onClick={() => onOpenLevel(q.levelId)}>
              去玩《{q.poemTitle}》
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
