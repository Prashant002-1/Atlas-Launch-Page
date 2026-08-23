import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp, settle, exitIn } from "../ease";
import { C, T, F } from "../theme";

// Masked line reveal — text slides up from behind an overflow-hidden mask.
// The premium move: fast out, long settle, no bounce.
export const Line: React.FC<{
  at: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  dur?: number;
  style?: React.CSSProperties;
  exitAt?: number;
}> = ({ at, children, size = 96, color = C.ink, weight = 470, dur = 26, style, exitAt }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: settle });
  const out = exitAt
    ? interpolate(frame, [exitAt, exitAt + 12], [0, 1], { ...clamp, easing: exitIn })
    : 0;
  return (
    <div style={{ overflow: "hidden", padding: "0.08em 0", margin: "-0.08em 0" }}>
      <div
        style={{
          ...T.display,
          fontWeight: weight,
          fontSize: size,
          color,
          transform: `translateY(${(1 - p) * 108 - out * 46}%)`,
          opacity: Math.min(1, p * 2) * (1 - out),
          willChange: "transform",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Word-by-word rise for supporting phrases
export const Words: React.FC<{
  at: number;
  text: string;
  size?: number;
  color?: string;
  gapFrames?: number;
  style?: React.CSSProperties;
  exitAt?: number;
}> = ({ at, text, size = 32, color = C.inkSoft, gapFrames = 4, style, exitAt }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const out = exitAt
    ? interpolate(frame, [exitAt, exitAt + 10], [0, 1], { ...clamp, easing: exitIn })
    : 0;
  return (
    <div style={{ ...T.sub, fontSize: size, color, opacity: 1 - out, ...style }}>
      {words.map((w, i) => {
        const s = at + i * gapFrames;
        const p = interpolate(frame, [s, s + 16], [0, 1], { ...clamp, easing: settle });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * 14}px)`,
              marginRight: "0.28em",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Small mono kicker label
export const Kicker: React.FC<{
  at: number;
  children: React.ReactNode;
  color?: string;
  exitAt?: number;
  style?: React.CSSProperties;
}> = ({ at, children, color = C.muted, exitAt, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 18], [0, 1], { ...clamp, easing: settle });
  const out = exitAt
    ? interpolate(frame, [exitAt, exitAt + 10], [0, 1], { ...clamp, easing: exitIn })
    : 0;
  return (
    <div
      style={{
        ...T.label,
        fontSize: 21,
        color,
        opacity: p * (1 - out),
        transform: `translateY(${(1 - p) * 10}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SerifI: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color,
}) => (
  <span style={{ fontFamily: F.serifItalic, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em", color }}>
    {children}
  </span>
);
