import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line } from "../text/Reveal";
import { C, F, PAD_X, T } from "../theme";
import { clamp, settle, exitIn } from "../ease";
import { RAMBLE, T5, sec } from "../timeline";

// THE DICTATION — no chrome, no box. The teacher's words type straight onto
// the paper, large; the rubric sets itself beside them as a flat ledger.
const ROWS = [
  { k: "Personality", v: "Curious, a little playful" },
  { k: "Method", v: "Analogies first, 3Blue1Brown style" },
  { k: "Visuals", v: "Sketches it when seeing helps" },
  { k: "Boundary", v: "Hints only. Never the answer.", accent: true },
  { k: "Sources", v: "Course readings, cited" },
  { k: "Applied", v: "Real examples, thesis tested" },
  { k: "Context", v: "Midterm problem 7 follow up" },
];

export const S5Build: React.FC = () => {
  const frame = useCurrentFrame();

  const out = interpolate(frame, [T5.exit, T5.exit + 12], [0, 1], { ...clamp, easing: exitIn });
  const p = interpolate(frame, [T5.typeStart, T5.typeEnd], [0, 1], clamp);
  const typed = RAMBLE.slice(0, Math.round(RAMBLE.length * Math.pow(p, 1.15)));
  const caretOn = p < 1 && frame % 16 < 10;
  // once the thought is complete, the dictation recedes and the line takes over
  const recede = interpolate(frame, [T5.recede, T5.recede + 14], [1, 0.24], { ...clamp, easing: settle });
  const ledgerIn = interpolate(frame, [sec(25.6), sec(26.1)], [0, 1], { ...clamp, easing: settle });

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Kicker at={sec(24.65)} dur={12} exitAt={T5.headline - 6} style={{ position: "absolute", left: PAD_X, top: 132 }}>
        Just tell it what you want · type or speak
      </Kicker>

      {/* the dictation — words straight onto the paper */}
      <div
        style={{
          position: "absolute",
          left: PAD_X,
          top: 220,
          width: 980,
          height: 660,
          overflow: "hidden",
          opacity: recede,
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 22%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 6,
            fontFamily: F.sans,
            fontSize: 31,
            lineHeight: 1.62,
            fontWeight: 430,
            color: C.ink,
            letterSpacing: "-0.012em",
          }}
        >
          {typed}
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 34,
              background: C.clay,
              verticalAlign: -6,
              marginLeft: 2,
              opacity: caretOn ? 1 : 0,
            }}
          />
        </div>
      </div>

      {/* the ledger — flat type, hairlines, no card */}
      <div style={{ position: "absolute", left: 1280, top: 224, width: 500, opacity: ledgerIn }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, paddingBottom: 12, borderBottom: "1px solid rgba(10,31,25,0.22)" }}>
          <span style={{ width: 10, height: 10, background: C.clay, alignSelf: "center" }} />
          <span style={{ ...T.label, fontSize: 14, color: C.inkSoft }}>Agent rubric</span>
          <span style={{ ...T.label, fontSize: 11, color: C.muted, marginLeft: "auto" }}>from your words</span>
        </div>
        {ROWS.map((r, i) => {
          const at = T5.rows[i];
          const rp = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: settle });
          return (
            <div
              key={r.k}
              style={{
                padding: "13px 0",
                borderBottom: "1px solid rgba(10,31,25,0.08)",
                opacity: rp,
                transform: `translateY(${(1 - rp) * 10}px)`,
              }}
            >
              <div style={{ ...T.label, fontSize: 11.5, color: C.muted, marginBottom: 5 }}>{r.k}</div>
              <div
                style={{
                  fontFamily: F.sans,
                  fontSize: 21,
                  fontWeight: 440,
                  color: r.accent ? C.clay : C.ink,
                  letterSpacing: "-0.012em",
                }}
              >
                {r.v}
              </div>
            </div>
          );
        })}
      </div>

      {/* the line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 122, textAlign: "center" }}>
        <Line at={T5.headline} size={58} dur={16} exitAt={T5.exit} style={{ textAlign: "center" }}>
          Your rubric. Your agent. No two alike.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
