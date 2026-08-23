import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, T } from "../theme";
import { clamp, settle, rand } from "../ease";

// abstract stand-in for text content — no dummy names, no dummy data
export const Shimmer: React.FC<{ w: number; h?: number; tone?: string; style?: React.CSSProperties }> = ({
  w,
  h = 11,
  tone = "#dde5d9",
  style,
}) => <div style={{ width: w, height: h, background: tone, borderRadius: 1, ...style }} />;

export const MonoTag: React.FC<{ children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.muted,
  border = "rgba(10,31,25,0.16)",
  style,
}) => (
  <span
    style={{
      ...T.label,
      fontSize: 12,
      color,
      border: `1px solid ${border}`,
      padding: "5px 9px",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

// assignment list row — coexistence made visible
export const AssignRow: React.FC<{
  at: number;
  tag: string;
  tagColor?: string;
  tagBorder?: string;
  barW: number;
  active?: boolean;
}> = ({ at, tag, tagColor, tagBorder, barW, active }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 16], [0, 1], { ...clamp, easing: settle });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "15px 18px",
        border: "1px solid rgba(10,31,25,0.10)",
        borderLeft: active ? `3px solid ${C.clay}` : "1px solid rgba(10,31,25,0.10)",
        background: active ? "rgba(191,95,59,0.06)" : C.paperLift,
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
      }}
    >
      <Shimmer w={barW} />
      <div style={{ marginLeft: "auto" }}>
        <MonoTag color={tagColor} border={tagBorder}>
          {tag}
        </MonoTag>
      </div>
    </div>
  );
};

// spec row inside the assignment-agent capsule
export const TermRow: React.FC<{ at: number; k: string; v: string; accent?: string }> = ({
  at,
  k,
  v,
  accent,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], { ...clamp, easing: settle });
  const tick = interpolate(frame, [at + 6, at + 18], [0, 1], { ...clamp, easing: settle });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: p,
        transform: `translateX(${(1 - p) * 18}px)`,
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24">
        <path
          d="M4 12.5 L9.5 18 L20 6.5"
          stroke={accent ?? C.ink}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={24}
          strokeDashoffset={24 * (1 - tick)}
        />
      </svg>
      <span style={{ ...T.label, fontSize: 13.5, color: C.muted, width: 118, flex: "none" }}>{k}</span>
      <span style={{ fontFamily: F.sans, fontSize: 19.5, fontWeight: 440, color: accent ?? C.ink, letterSpacing: "-0.01em" }}>
        {v}
      </span>
    </div>
  );
};

// chat bubble
export const Bubble: React.FC<{
  at: number;
  who: "agent" | "student";
  children: React.ReactNode;
  width?: number | string;
}> = ({ at, who, children, width = "82%" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 16], [0, 1], { ...clamp, easing: settle });
  const isAgent = who === "agent";
  return (
    <div
      style={{
        maxWidth: width,
        alignSelf: isAgent ? "flex-start" : "flex-end",
        background: isAgent ? "#e7ede2" : C.ink,
        color: isAgent ? "#1d3129" : C.paperLift,
        padding: "15px 20px",
        borderRadius: 9,
        borderBottomLeftRadius: isAgent ? 2 : 9,
        borderBottomRightRadius: isAgent ? 9 : 2,
        fontFamily: F.sans,
        fontSize: 21,
        lineHeight: 1.42,
        fontWeight: 420,
        letterSpacing: "-0.005em",
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
      }}
    >
      {children}
    </div>
  );
};

// quiet understanding indicator — a bar, no numbers, no grades
export const IndicatorRow: React.FC<{ at: number; label: string; fill: number }> = ({
  at,
  label,
  fill,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: settle });
  const bar = interpolate(frame, [at + 6, at + 34], [0, fill], { ...clamp, easing: settle });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
      <div style={{ ...T.label, fontSize: 13, color: C.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ height: 7, background: "rgba(10,31,25,0.09)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, width: `${bar * 100}%`, background: C.clay }} />
      </div>
    </div>
  );
};

// the class the capsule ships to — a row of anonymous seats
export const ClassDots: React.FC<{ at: number; n?: number; cx: number; cy: number; spread: number }> = ({
  at,
  n = 26,
  cx,
  cy,
  spread,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const jitter = rand(i * 7 + 3) * 10 - 5;
        const x = cx - spread / 2 + (spread / (n - 1)) * i;
        const y = cy + Math.sin((i / (n - 1)) * Math.PI) * -26 + jitter;
        const s = at + i * 1.1;
        const p = interpolate(frame, [s, s + 14], [0, 1], { ...clamp, easing: settle });
        const lit = interpolate(frame, [s + 10, s + 26], [0, 1], { ...clamp, easing: settle });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 7,
              top: y - 7,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: lit > 0.5 ? C.clay : "rgba(10,31,25,0.16)",
              opacity: p,
              transform: `scale(${0.6 + p * 0.4})`,
            }}
          />
        );
      })}
    </>
  );
};
