import { NextResponse } from "next/server";

/** 揭晓后 AI 个性化点评（试点）；需配置 OPENAI_API_KEY 或 COMMENT_API_KEY */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      author,
      userVerse,
      bandText,
      targetHits,
      targetTotal,
    } = body as {
      title?: string;
      author?: string;
      userVerse?: string;
      bandText?: string;
      targetHits?: number;
      targetTotal?: number;
    };

    const fallback = buildFallback(
      title,
      author,
      userVerse,
      bandText,
      targetHits,
      targetTotal
    );

    const key = process.env.COMMENT_API_KEY || process.env.OPENAI_API_KEY;
    const base =
      process.env.COMMENT_API_BASE ||
      process.env.OPENAI_API_BASE ||
      "https://api.openai.com/v1";
    const model = process.env.COMMENT_API_MODEL || "gpt-4o-mini";

    if (!key) {
      return NextResponse.json({ text: fallback, mode: "template" });
    }

    const prompt = `你是一位温和的中文古典文学老师。学生刚完成互动诗史游戏《${title}》（${author}）。
学生拼出的句子：${userVerse || "（未记录）"}
系统评价：${bandText || ""}
命中原作句数：${targetHits ?? "?"}/${targetTotal ?? "?"}
请用 80～120 字中文点评：肯定其选择中可取处，联系诗人处境，不说教，不用「作为AI」。`;

    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ text: fallback, mode: "template" });
    }

    const data = await res.json();
    const text =
      data.choices?.[0]?.message?.content?.trim() || fallback;
    return NextResponse.json({ text, mode: "ai" });
  } catch {
    return NextResponse.json({
      text: "今日点评暂不可用，不妨再读一遍真迹，看看哪一句最贴你的心意。",
      mode: "error",
    });
  }
}

function buildFallback(
  title?: string,
  author?: string,
  userVerse?: string,
  bandText?: string,
  targetHits?: number,
  targetTotal?: number
): string {
  const hit =
    targetTotal && targetHits !== undefined
      ? targetHits >= targetTotal
        ? "你与原作几乎同工，说明已摸到诗人的筋骨。"
        : targetHits > 0
          ? "你有几处与真迹相合，其余换法亦可见另一种心绪。"
          : "你走了另一条路——对照真迹，看看诗人为何如此措辞。"
      : "";
  return `《${title || "此诗"}》${author ? `（${author}）` : ""}：${bandText || ""} ${hit}`.trim();
}
