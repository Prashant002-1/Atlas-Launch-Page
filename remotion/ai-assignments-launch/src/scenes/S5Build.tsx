import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { C, F, PAD_X, T } from "../theme";
import { clamp, settle, exitIn, glide } from "../ease";
import { RAMBLE, T5, sec } from "../timeline";

// THE BUILD — the prompt is the interface. Every phrase you type
// becomes a rubric row, live, on the right.
const ROWS = [
  { k: "Personality", v: "Curious, a little playful", frac: 0.075 },
  { k: "Method", v: "Analogies first, 3Blue1Brown style", frac: 0.3 },
  { k: "Visuals", v: "Sketches it when seeing helps", frac: 0.41 },
  { k: "Boundary", v: "Hints only. Never the answer.", frac: 0.52, accent: true },
  { k: "Sources", v: "Course readings, cited", frac: 0.65 },
  { k: "Applied", v: "Real examples, thesis tested", frac: 0.76 },
  { k: "Context", v: "Midterm problem 7 follow up", frac: 0.97 },
];

export const S5Build: React.FC = () => {
  const frame = useCurrentFrame();

  const winIn = interpolate(frame, [T5.winIn, T5.winIn + 20], [0, 1], { ...clamp, easing: settle });
  const cardIn = interpolate(frame, [T5.cardIn, T5.cardIn + 20], [0, 1], { ...clamp, easing: settle });
  const out = interpolate(frame, [T5.exit, T5.exit + 14], [0, 1], { ...clamp, easing: exitIn });

  // accelerating type
  const p = interpolate(frame, [T5.typeStart, T5.typeEnd], [0, 1], clamp);
  const prog = Math.pow(p, 1.18);
  const typed = RAMBLE.slice(0, Math.round(RAMBLE.length * prog));
  const sent = frame >= T5.send;
  const caretOn = !sent && frame % 18 < 11;
  const sendPress = interpolate(frame, [T5.send - 4, T5.send], [0, 1], clamp);
  const pulse = 1 + 0.015 * Math.sin(interpolate(frame, [T5.pulse, T5.pulse + 18], [0, Math.PI], clamp));

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Kicker at={sec(27.9)} dur={14} exitAt={T5.headline - 6} style={{ position: "absolute", left: PAD_X, top: 118 }}>
        Just tell it what you want · type or speak
      </Kicker>

      {/* the prompt */}
      <div
        style={{
          position: "absolute",
          left: PAD_X,
          top: 210,
          opacity: winIn,
          transform: `translateY(${(1 - winIn) * 50}px)`,
        }}
      >
        <MacWindow title="Course agent" width={880}>
          <div
            style={{
              position: "relative",
              height: 452,
              overflow: "hidden",
              border: "1px solid rgba(10,31,25,0.18)",
              background: "#fbfcf9",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                maxHeight: "100%",
                padding: "18px 24px",
                fontFamily: F.sans,
                fontSize: 22,
                lineHeight: 1.5,
                color: "#22352c",
                letterSpacing: "-0.004em",
              }}
            >
              {typed}
              <span
                style={{
                  display: "inline-block",
                  width: 2.5,
                  height: 24,
                  background: C.clay,
                  verticalAlign: -4,
                  opacity: caretOn ? 1 : 0,
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 46,
                background: "linear-gradient(to bottom, #fbfcf9, rgba(251,252,249,0))",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <div
              style={{
                ...T.label,
                fontSize: 13.5,
                color: C.paperLift,
                background: C.ink,
                opacity: sent ? 0.55 : 1,
                padding: "12px 24px",
                transform: `scale(${1 - sendPress * 0.04})`,
              }}
            >
              {sent ? "Sent" : "Send to agent"}
            </div>
          </div>
        </MacWindow>
      </div>

      {/* the rubric, assembling live */}
      <div
        style={{
          position: "absolute",
          left: 1210,
          top: 236,
          width: 566,
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 40}px) scale(${pulse})`,
          background: C.paperLift,
          boxShadow: "0 0 0 1px rgba(10,31,25,0.14), 0 22px 52px rgba(10,31,25,0.09)",
          padding: "26px 30px 30px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ width: 11, height: 11, background: C.clay }} />
          <span style={{ ...T.label, fontSize: 14, color: C.inkSoft }}>Agent rubric</span>
          <span style={{ ...T.label, fontSize: 11.5, color: C.muted, marginLeft: "auto" }}>
            building live
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14.5 }}>
          {ROWS.map((r, i) => {
            const at = T5.rows[i];
            const rp = interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: settle });
            return (
              <div
                key={r.k}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  opacity: rp,
                  transform: `translateX(${(1 - rp) * 18}px)`,
                }}
              >
                <span style={{ ...T.label, fontSize: 13, color: C.muted, width: 128, flex: "none" }}>{r.k}</span>
                <span
                  style={{
                    fontFamily: F.sans,
                    fontSize: 19,
                    fontWeight: 440,
                    color: r.accent ? C.clay : C.ink,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {r.v}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* sparks: each completed phrase flies to its row */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {ROWS.map((r, i) => {
          const at = T5.rows[i];
          const fp = interpolate(frame, [at - 8, at + 8], [0, 1], { ...clamp, easing: glide });
          if (fp <= 0 || fp >= 1) return null;
          const x0 = 1000, y0 = 300 + r.frac * 330;
          const x1 = 1210, y1 = 316 + i * 42;
          const x = x0 + (x1 - x0) * fp;
          const y = y0 + (y1 - y0) * fp - Math.sin(fp * Math.PI) * 46;
          return <circle key={i} cx={x} cy={y} r={5} fill={C.clay} opacity={Math.sin(fp * Math.PI)} />;
        })}
      </svg>

      {/* headline after send */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 122, textAlign: "center" }}>
        <Line at={T5.headline} size={58} dur={20} exitAt={T5.exit} style={{ textAlign: "center" }}>
          Your rubric. Your agent. No two alike.
        </Line>
      </div>

    </AbsoluteFill>
  );
};
