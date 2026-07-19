// 纯 SVG 水墨插画：无需任何图片资源，可无限缩放，随主题着色。
// 四种意境：远山、孤月、江水、修竹；按关卡 id 稳定取一种。

export type InkVariant = "mountains" | "moon" | "river" | "bamboo";

const VARIANTS: InkVariant[] = ["mountains", "moon", "river", "bamboo"];

// 由字符串稳定地散列到一种意境，保证同一关每次都同一幅画
export function pickVariant(seed: string): InkVariant {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return VARIANTS[h % VARIANTS.length];
}

export default function InkScene({
  variant,
  seed,
  className,
  accent = "#9c3b2e",
}: {
  variant?: InkVariant;
  seed?: string;
  className?: string;
  accent?: string;
}) {
  const v: InkVariant = variant ?? (seed ? pickVariant(seed) : "mountains");
  return (
    <svg
      className={className}
      viewBox="0 0 320 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="img"
    >
      {v === "mountains" && <Mountains accent={accent} />}
      {v === "moon" && <Moon accent={accent} />}
      {v === "river" && <River accent={accent} />}
      {v === "bamboo" && <Bamboo accent={accent} />}
    </svg>
  );
}

function Mountains({ accent }: { accent: string }) {
  return (
    <g fill="none">
      <circle cx="232" cy="52" r="22" fill={accent} opacity="0.5" />
      <path
        d="M0 132 L46 86 L78 110 L120 64 L150 104 L196 72 L240 116 L284 84 L320 120 L320 160 L0 160 Z"
        fill="#2b2b2b"
        opacity="0.18"
      />
      <path
        d="M0 150 L40 120 L84 142 L132 104 L176 138 L226 110 L272 140 L320 116 L320 160 L0 160 Z"
        fill="#2b2b2b"
        opacity="0.32"
      />
      <path
        d="M0 132 L46 86 L78 110 L120 64 L150 104 L196 72 L240 116 L284 84 L320 120"
        stroke="#1f1f1f"
        strokeWidth="1.4"
        opacity="0.5"
      />
    </g>
  );
}

function Moon({ accent }: { accent: string }) {
  return (
    <g fill="none">
      <circle cx="160" cy="62" r="34" fill="#1f1f1f" opacity="0.06" />
      <circle
        cx="160"
        cy="62"
        r="34"
        stroke="#1f1f1f"
        strokeWidth="1.2"
        opacity="0.35"
      />
      <path
        d="M64 70 q26 -14 60 -4 M196 60 q30 -10 58 4"
        stroke="#2b2b2b"
        strokeWidth="1.2"
        opacity="0.3"
      />
      <path
        d="M0 150 q80 -16 160 0 q80 16 160 0 L320 160 L0 160 Z"
        fill="#2b2b2b"
        opacity="0.22"
      />
      <path
        d="M236 150 l-2 -34 M246 150 l1 -40 M256 150 l-1 -30"
        stroke="#1f1f1f"
        strokeWidth="1.3"
        opacity="0.45"
      />
      <circle cx="160" cy="62" r="9" fill={accent} opacity="0.18" />
    </g>
  );
}

function River({ accent }: { accent: string }) {
  return (
    <g fill="none">
      <path
        d="M40 44 L70 24 L96 42 Z"
        fill="#2b2b2b"
        opacity="0.28"
      />
      <path d="M30 60 q40 6 80 0" stroke="#1f1f1f" strokeWidth="1.2" opacity="0.3" />
      <path
        d="M0 92 q60 -10 120 0 q60 10 120 0 q40 -7 80 0"
        stroke="#2b2b2b"
        strokeWidth="1.3"
        opacity="0.4"
      />
      <path
        d="M0 112 q60 10 120 0 q60 -10 120 0 q40 7 80 0"
        stroke="#2b2b2b"
        strokeWidth="1.3"
        opacity="0.34"
      />
      <path
        d="M0 132 q60 -10 120 0 q60 10 120 0 q40 -7 80 0"
        stroke="#2b2b2b"
        strokeWidth="1.3"
        opacity="0.26"
      />
      <ellipse cx="150" cy="120" rx="22" ry="4" fill={accent} opacity="0.18" />
    </g>
  );
}

function Bamboo({ accent }: { accent: string }) {
  return (
    <g fill="none" stroke="#1f1f1f">
      <g opacity="0.42" strokeWidth="2.4">
        <path d="M70 160 L66 8" />
        <path d="M66 44 q-16 -10 -30 -6 M66 78 q18 -8 32 -2 M66 112 q-16 -8 -28 -3" />
      </g>
      <g opacity="0.3" strokeWidth="2">
        <path d="M120 160 L124 24" />
        <path d="M124 58 q16 -8 30 -3 M124 92 q-14 -8 -26 -2" />
      </g>
      <g opacity="0.22" strokeWidth="1.6">
        <path d="M250 160 L246 40" />
        <path d="M246 70 q-14 -7 -26 -2 M246 104 q14 -7 26 -2" />
      </g>
      <circle cx="276" cy="40" r="16" fill={accent} stroke="none" opacity="0.4" />
    </g>
  );
}
