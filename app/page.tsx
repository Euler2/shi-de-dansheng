"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LEVELS } from "@/lib/levels";
import { buildLineDiffs } from "@/lib/compare";
import { dateKey } from "@/lib/daily";
import { recordCompletion } from "@/lib/collection";
import {
  clearFilters,
  dimsForType,
  FACET_LABELS,
  filterLevels,
  getFacetValues,
  toggleFilter,
  type FacetFilters,
} from "@/lib/taxonomy";
import { startAmbient } from "@/lib/ambient";
import InkScene from "@/components/InkScene";
import { DailyPanel } from "@/components/DailyPanel";
import { CollectionWall } from "@/components/CollectionWall";
import { ExamCatalog } from "@/components/ExamCatalog";
import { QuizPilot } from "@/components/QuizPilot";
import { StoryCatalog } from "@/components/StoryCatalog";
import type { FacetDimension, Level, Option, Step } from "@/schema/level";

type HubTab = "today" | "browse" | "jianpu" | "exam" | "story" | "quiz";

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = LEVELS.find((l) => l.id === activeId) ?? null;

  if (active) {
    return (
      <Player key={active.id} level={active} onExit={() => setActiveId(null)} />
    );
  }

  return <Hub onPick={setActiveId} />;
}

function Hub({ onPick }: { onPick: (id: string) => void }) {
  const [hub, setHub] = useState<HubTab>("today");

  return (
    <main className="page">
      <InkScene variant="mountains" className="page-bg" />
      <header className="hero">
        <InkScene variant="moon" className="hero-art" />
        <h1>诗的诞生</h1>
        <p className="subtitle">
          v4 · 诗与互动史一体 · 每日双卡 · 课标目录 · 互动史 {LEVELS.filter((l) => l.type === "history").length} 篇
        </p>
      </header>

      <div className="hub-tabs">
        <button
          className={hub === "today" ? "tab on" : "tab"}
          onClick={() => setHub("today")}
        >
          今日
        </button>
        <button
          className={hub === "browse" ? "tab on" : "tab"}
          onClick={() => setHub("browse")}
        >
          浏览
        </button>
        <button
          className={hub === "jianpu" ? "tab on" : "tab"}
          onClick={() => setHub("jianpu")}
        >
          笺谱
        </button>
        <button
          className={hub === "exam" ? "tab on" : "tab"}
          onClick={() => setHub("exam")}
        >
          课标
        </button>
        <button
          className={hub === "story" ? "tab on" : "tab"}
          onClick={() => setHub("story")}
        >
          互动史
        </button>
        <button
          className={hub === "quiz" ? "tab on" : "tab"}
          onClick={() => setHub("quiz")}
        >
          猜真句
        </button>
      </div>

      {hub === "today" && <DailyPanel levels={LEVELS} onPlay={onPick} />}
      {hub === "browse" && <Browse onPick={onPick} />}
      {hub === "jianpu" && <CollectionWall onPick={onPick} />}
      {hub === "exam" && <ExamCatalog onPlay={onPick} />}
      {hub === "story" && <StoryCatalog onPlay={onPick} />}
      {hub === "quiz" && <QuizPilot levels={LEVELS} onOpenLevel={onPick} />}

      <footer className="foot">
        知乎人文季 · 用 AI 重新看见人
        <br />
        © 2026 本软件著作权归作者所有。未经许可不得复制、镜像或商业使用。
      </footer>
    </main>
  );
}

function Browse({ onPick }: { onPick: (id: string) => void }) {
  const [filters, setFilters] = useState<FacetFilters>({});
  const type = "poem";
  const dims = dimsForType(type);
  const list = filterLevels(LEVELS, type, filters);
  const hasFilters = Object.values(filters).some((v) => v?.length);

  return (
    <>
      <p className="facet-hint">
        这里专门检索诗文关卡；历史互动故事请从顶部「互动史」进入。标签可交叉：一首唐诗五言绝句，同时属于「唐」「李白」「五言绝句」——多选会收窄结果，同一维度里选多个表示「或」。
      </p>

      {dims.map((dim) => {
        const values = getFacetValues(LEVELS, type, dim);
        if (!values.length) return null;
        const selected = filters[dim] || [];
        return (
          <div key={dim} className="facet-block">
            <div className="facet-dim">{FACET_LABELS[dim]}</div>
            <div className="facet-chips">
              {values.map((v) => (
                <button
                  key={v}
                  className={selected.includes(v) ? "chip on" : "chip"}
                  onClick={() => setFilters(toggleFilter(filters, dim, v))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {hasFilters && (
        <button className="clear-filters" onClick={() => setFilters(clearFilters())}>
          清除筛选
        </button>
      )}

      <p className="facet-dim" style={{ marginBottom: 12 }}>
        共 {list.length} 篇
      </p>

      <div className="grid">
        {list.map((l) => (
          <button key={l.id} className="lv-card" onClick={() => onPick(l.id)}>
            <InkScene seed={l.id} className="lv-art" />
            <span className="lv-era">{l.era}</span>
            <span className="lv-title">{l.title}</span>
            <span className="lv-author">{l.author}</span>
            <span className="lv-sub">{l.subtitle}</span>
            <FacetTags facets={l.facets} dims={dims} />
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="facet-hint">没有符合当前筛选的内容，试试减少标签。</p>
      )}
    </>
  );
}

function FacetTags({
  facets,
  dims,
}: {
  facets?: Level["facets"];
  dims: FacetDimension[];
}) {
  if (!facets) return null;
  const tags: string[] = [];
  for (const d of dims) {
    facets[d]?.forEach((t) => tags.push(t));
  }
  if (!tags.length) return null;
  return (
    <span className="lv-facets">
      {tags.slice(0, 5).map((t) => (
        <span key={t} className="lv-tag">
          {t}
        </span>
      ))}
    </span>
  );
}

function Typewriter({ text, speed = 50 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (!text) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return (
    <span className="tw" onClick={() => setN(text.length)}>
      {text.slice(0, n)}
      {n < text.length && <span className="tw-caret">｜</span>}
    </span>
  );
}

type Phase = "step" | "interlude" | "reveal";

function Player({ level, onExit }: { level: Level; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("step");
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [inkTick, setInkTick] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<ReturnType<typeof startAmbient> | null>(null);

  useEffect(() => () => ambientRef.current?.stop(), []);

  const step: Step | undefined = level.steps[idx];
  const isLast = idx === level.steps.length - 1;
  const chosen = (s: Step): Option | undefined =>
    s.options.find((o) => o.id === answers[s.id]);

  function ink() {
    setInkTick((t) => t + 1);
  }

  function toggleMusic() {
    if (musicOn) {
      ambientRef.current?.stop();
      ambientRef.current = null;
      setMusicOn(false);
    } else {
      ambientRef.current = startAmbient();
      setMusicOn(!!ambientRef.current);
    }
  }

  function pick(opt: Option) {
    setAnswers((a) => ({ ...a, [step!.id]: opt.id }));
    if (opt.outcome || opt.feedback || opt.altNote || step!.whatIf) {
      setPhase("interlude");
    } else {
      advance();
    }
  }

  function advance() {
    setWhatIfOpen(false);
    ink();
    if (isLast) setPhase("reveal");
    else {
      setIdx((i) => i + 1);
      setPhase("step");
    }
  }

  const summary = useMemo(() => {
    const opts = level.steps.map((s) =>
      s.options.find((o) => o.id === answers[s.id])
    );
    const fragments = opts.map((o) => o?.fragment).filter(Boolean) as string[];
    const path = opts.map((o) => o?.outcome).filter(Boolean) as string[];
    const composeSteps = level.steps.filter((s) => s.kind === "compose");
    const targetTotal = composeSteps.reduce(
      (n, s) => n + (s.options.some((o) => o.isTarget) ? 1 : 0),
      0
    );
    const targetCount = opts.filter((o) => o?.isTarget).length;
    const band =
      level.scoring.bands.find(
        (b) => targetCount >= b.min && targetCount <= b.max
      ) ?? level.scoring.bands[level.scoring.bands.length - 1];
    const lineDiffs =
      level.type === "poem" ? buildLineDiffs(level, answers) : [];
    return { fragments, path, band, targetCount, targetTotal, lineDiffs };
  }, [answers, level]);

  useEffect(() => {
    if (phase !== "reveal" || saved) return;
    recordCompletion(
      level.id,
      summary.targetCount,
      summary.targetTotal,
      dateKey()
    );
    setSaved(true);
  }, [phase, saved, level.id, summary.targetCount, summary.targetTotal]);

  async function fetchAiComment() {
    if (aiComment || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: level.title,
          author: level.author,
          userVerse: summary.fragments.join("，"),
          bandText: summary.band?.text,
          targetHits: summary.targetCount,
          targetTotal: summary.targetTotal,
        }),
      });
      const data = await res.json();
      setAiComment(data.text);
      setAiMode(data.mode);
    } catch {
      setAiComment("点评暂不可用，请稍后再试。");
      setAiMode("error");
    } finally {
      setAiLoading(false);
    }
  }

  async function exportImage() {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#f5efe2",
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.download = `${level.title}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  const progress = `${Math.min(idx + 1, level.steps.length)} / ${level.steps.length}`;

  return (
    <main className="page">
      <InkScene seed={level.id} className="page-bg" />
      {inkTick > 0 && <div key={inkTick} className="ink-veil" />}

      <div className="player-top">
        <button className="link-btn" onClick={onExit}>
          ← 返回
        </button>
        <span className="player-title">
          {level.title}
          <span className="player-author">／ {level.author}</span>
        </span>
        <div className="top-right">
          <button
            className={musicOn ? "music on" : "music"}
            onClick={toggleMusic}
          >
            {musicOn ? "♪ 配乐 开" : "♪ 配乐 关"}
          </button>
          {phase !== "reveal" && <span className="progress">{progress}</span>}
        </div>
      </div>

      {(phase === "step" || phase === "interlude") && step && (
        <section className="stage">
          {idx === 0 && phase === "step" && (
            <p className="intro">
              <Typewriter text={level.intro} />
            </p>
          )}
          {step.narration && phase === "step" && (
            <p className="narration">
              <Typewriter text={step.narration} />
            </p>
          )}

          {phase === "step" && (
            <>
              <p className="prompt">{step.prompt}</p>
              <div className="options">
                {step.options.map((o) => (
                  <button key={o.id} className="option" onClick={() => pick(o)}>
                    <span className="option-label">{o.label}</span>
                    {o.note && <span className="option-note">{o.note}</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === "interlude" && (
            <div className="interlude">
              {chosen(step)?.outcome && (
                <p className="outcome">
                  <Typewriter text={chosen(step)!.outcome as string} />
                </p>
              )}
              {(chosen(step)?.feedback || chosen(step)?.altNote) && (
                <p className="feedback">
                  {chosen(step)!.feedback || chosen(step)!.altNote}
                </p>
              )}

              {step.whatIf && (
                <div className="whatif">
                  {!whatIfOpen ? (
                    <button
                      className="whatif-teaser"
                      onClick={() => setWhatIfOpen(true)}
                    >
                      {step.whatIf.teaser}
                    </button>
                  ) : (
                    <div className="whatif-body">
                      <p className="whatif-alt">{step.whatIf.alternateText}</p>
                      <p className="whatif-reveal">{step.whatIf.revealText}</p>
                    </div>
                  )}
                </div>
              )}

              <button className="primary" onClick={advance}>
                {isLast ? "看看对照与真迹" : "继续"}
              </button>
            </div>
          )}
        </section>
      )}

      {phase === "reveal" && (
        <section className="stage">
          <div className="reveal-block">
            <h3 className="reveal-h">
              {level.type === "poem" ? "你拼出的版本" : "你走过的路"}
            </h3>
            {level.type === "poem" ? (
              <p className="your-verse">{summary.fragments.join("，")}。</p>
            ) : (
              <ul className="your-path">
                {summary.path.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
            <p className="band">{summary.band?.text}</p>
          </div>

          {level.type === "poem" && summary.lineDiffs.length > 0 && (
            <div className="compare-block">
              <h3 className="compare-title">逐句对照 · 为什么说</h3>
              {summary.lineDiffs.map((d) => (
                <div
                  key={d.stepId}
                  className={d.hit ? "diff-row hit" : "diff-row"}
                >
                  <div className="diff-prompt">{d.prompt}</div>
                  <div className="diff-lines">
                    <div className="diff-col yours">
                      <span className="diff-label">你的选择</span>
                      {d.yours}
                    </div>
                    <div className="diff-col real">
                      <span className="diff-label">{level.author}原作</span>
                      {d.original}
                    </div>
                  </div>
                  <p className="diff-note">{d.note}</p>
                </div>
              ))}
            </div>
          )}

          <div className="ai-comment">
            <span className="pilot-tag">试点</span>
            <h4>AI 个性化点评</h4>
            {!aiComment ? (
              <button className="export" onClick={fetchAiComment} disabled={aiLoading}>
                {aiLoading ? "正在生成……" : "生成点评"}
              </button>
            ) : (
              <p>
                {aiComment}
                {aiMode === "template" && (
                  <small style={{ display: "block", marginTop: 8, color: "var(--ink-faint)" }}>
                    （未配置 API Key 时为模板点评；设置 COMMENT_API_KEY 可启用大模型）
                  </small>
                )}
              </p>
            )}
          </div>

          <p className="reveal-divider">— 真迹 —</p>

          <div className="share-wrap">
            <div className="share-long" ref={cardRef}>
              <div className="sl-art">
                <InkScene seed={level.id} className="sl-art-svg" />
              </div>
              <div className="sl-top">
                <span className="sl-kind">
                  {level.type === "poem" ? "真迹" : "真实历史"}
                </span>
                <span className="sl-era">{level.era}</span>
              </div>
              <h2 className="sl-title">{level.title}</h2>
              <div className="sl-author">{level.author}</div>
              <div className="sl-rule" />
              <p className="real-text">{level.reveal.realText}</p>
              <p className="real-source">—— {level.reveal.source}</p>
              <p className="analysis">{level.reveal.analysis}</p>
              <div className="sl-takeaway-wrap">
                <span className="sl-seal">印</span>
                <p className="takeaway">{level.reveal.takeaway}</p>
              </div>
              <div className="sl-foot">诗的诞生 · 知乎人文季</div>
            </div>
          </div>

          <div className="reveal-actions">
            <button className="export" onClick={exportImage} disabled={exporting}>
              {exporting ? "正在生成长图……" : "⤓ 导出分享图"}
            </button>
            <button className="export" onClick={onExit}>
              换一篇
            </button>
          </div>
        </section>
      )}

      <footer className="foot">
        知乎人文季 · 用 AI 重新看见人
        <br />
        © 2026 本软件著作权归作者所有。未经许可不得复制、镜像或商业使用。
      </footer>
    </main>
  );
}
