import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line } from "../text/Reveal";
import { C, F, PAD_X, T } from "../theme";
import { clamp, settle, exitIn } from "../ease";
import { RAMBLE, T5, sec } from "../timeline";

// THE DICTATION — three clean movements, each with the stage to itself:
// 1. the teacher's words type straight onto the paper (starting mid-screen)
// 2. the agent takes those instructions and builds the rubric from them
// 3. the line: your rubric, your agent, no two alike
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

  // ---- movement 1: dictation ----
  const p = interpolate(frame, [T5.typeStart, T5.typeEnd], [0, 1], clamp);
  const typed = RAMBLE.slice(0, Math.round(RAMBLE.length * Math.pow(p, 1.15)));
  const caretOn = p < 1 && frame % 16 < 10;
  // the words leave the stage entirely before the rubric arrives
  const dictOut = interpolate(frame, [T5.recede, T5.recede + 12], [1, 0], { ...clamp, easing: exitIn });
  // first line begins mid-screen, grows downward, then crawls up
  const lineH = 32 * 1.6;
  const estLines = Math.max(1, Math.ceil(typed.length / 63));
  const textH = estLines * lineH;
  const boxH = 700;
  const topPos = Math.min(260, boxH - 40 - textH);

  // ---- movement 2: the rubric, from your instructions ----
  const ledgerIn = interpolate(frame, [T5.rows[0] - 8, T5.rows[0] + 4], [0, 1], { ...clamp, easing: settle });
  const ledgerOut = interpolate(frame, [T5.ledgerOut, T5.ledgerOut + 12], [1, 0], { ...clamp, easing: exitIn });

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Kicker
        at={sec(24.65)}
        exitAt={T5.recede - 2}
        style={{ position: "absolute", left: PAD_X, top: 132 }}
      >
        Just tell it what you want · type or speak
      </Kicker>

      {/* 1 — the words, straight onto the paper */}
      {dictOut > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: PAD_X,
            top: 200,
            width: 1240,
            height: boxH,
            overflow: "hidden",
            opacity: dictOut,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 16%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 16%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: topPos,
              fontFamily: F.sans,
              fontSize: 32,
              lineHeight: 1.6,
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
      )}

      {/* 2 — the agent builds the rubric from those instructions */}
      {ledgerIn > 0.01 && ledgerOut > 0.01 && (
        <div style={{ position: "absolute", left: 660, top: 178, width: 600, opacity: ledgerIn * ledgerOut }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              paddingBottom: 12,
              borderBottom: "1px solid rgba(10,31,25,0.22)",
            }}
          >
            <span style={{ ...T.label, fontSize: 14, color: C.inkSoft }}>Rubric</span>
            <span style={{ ...T.label, fontSize: 11, color: C.muted, marginLeft: "auto" }}>
              from your instructions
            </span>
          </div>
          {ROWS.map((r, i) => {
            const at = T5.rows[i];
            const rp = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: settle });
            return (
              <div
                key={r.k}
                style={{
                  padding: "12px 0",
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
      )}

      {/* 3 — the line, alone on the paper */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center" }}>
        <Line at={T5.headline} size={72} dur={16} exitAt={T5.exit} style={{ textAlign: "center" }}>
          Your rubric. Your agent. No two alike.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
