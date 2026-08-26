import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { Bubble, MonoTag } from "../ui/bits";
import { C, T } from "../theme";
import { clamp, settle, exitIn } from "../ease";
import { T7, sec } from "../timeline";

// The student's side — personable, specific, and it can draw.
export const S7Student: React.FC = () => {
  const frame = useCurrentFrame();

  const winIn = interpolate(frame, [T7.win, T7.win + 26], [0, 1], { ...clamp, easing: settle });
  const push = interpolate(frame, [T7.win, sec(66.6)], [1, 1.025], clamp);
  const out = interpolate(frame, [T7.exit, T7.exit + 16], [0, 1], { ...clamp, easing: exitIn });

  const timer =
    frame < sec(55) ? "38:04" : frame < sec(59) ? "37:41" : frame < sec(63) ? "37:12" : "36:48";

  // the sketch: axes, a confident curve, then a fan of diverging ghosts where data thins
  const ax = interpolate(frame, [T7.sketch, T7.sketch + 16], [0, 1], { ...clamp, easing: settle });
  const curve = interpolate(frame, [T7.sketch + 12, T7.sketch + 40], [0, 1], { ...clamp, easing: settle });
  const ghosts = interpolate(frame, [T7.sketch + 40, T7.sketch + 66], [0, 1], { ...clamp, easing: settle });

  const ring = (r: number, o: number, phase: number) => (
    <circle
      cx={0}
      cy={0}
      r={r * (1 + 0.012 * Math.sin(frame / 46 + phase))}
      stroke={C.clay}
      strokeOpacity={o}
      strokeWidth={1.2}
      fill="none"
    />
  );
  const ringsIn = interpolate(frame, [sec(55), sec(57)], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(1470, 520)" opacity={ringsIn * 0.5}>
          {ring(280, 0.22, 0)}
          {ring(370, 0.14, 1.4)}
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 170,
          top: 222,
          opacity: winIn,
          transform: `translateY(${(1 - winIn) * 60}px) scale(${push})`,
          transformOrigin: "center 40%",
        }}
      >
        <MacWindow
          title="AI Assignment"
          width={700}
          right={
            <span
              style={{
                ...T.label,
                fontSize: 13,
                color: C.muted,
                border: "1px solid rgba(10,31,25,0.14)",
                padding: "5px 10px",
                fontVariantNumeric: "tabular-nums",
                background: "#fbfcf9",
              }}
            >
              {timer}
            </span>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Bubble at={T7.a1} who="agent" width="90%">
              Heads up: this will be on the midterm. Worth getting right.
            </Bubble>
            <Bubble at={T7.a2} who="agent" width="72%">
              Start me off. What&rsquo;s your claim, in one sentence?
            </Bubble>
            <Bubble at={T7.stu} who="student" width="80%">
              That the model breaks when the data gets thin.
            </Bubble>
            <Bubble at={T7.a3} who="agent" width="94%">
              Good instinct. Here&rsquo;s the picture. Then we test it on something real.
              <svg width={560} height={190} style={{ display: "block", marginTop: 12 }}>
                {/* axes */}
                <path
                  d="M 26 12 L 26 156 L 540 156"
                  stroke="#4a5f55"
                  strokeWidth={1.6}
                  fill="none"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={100 * (1 - ax)}
                />
                {/* confident fit where data is dense */}
                <path
                  d="M 30 132 C 110 118 190 96 300 84"
                  stroke={C.ink}
                  strokeWidth={2.6}
                  fill="none"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={100 * (1 - curve)}
                />
                {/* data points, dense then sparse */}
                {[36, 58, 78, 96, 118, 142, 170, 198, 232, 268, 372, 476].map((x, i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={136 - i * 4.4 - (i > 9 ? 8 : 0)}
                    r={3}
                    fill="#4a5f55"
                    opacity={ax * (i > 9 ? 0.45 : 0.8)}
                  />
                ))}
                {/* the fan of maybes where data thins */}
                {[
                  "M 300 84 C 380 72 450 40 536 18",
                  "M 300 84 C 380 78 450 70 536 62",
                  "M 300 84 C 380 88 450 108 536 128",
                ].map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    stroke={C.clay}
                    strokeWidth={1.8}
                    strokeDasharray="5 7"
                    fill="none"
                    opacity={ghosts * (0.75 - i * 0.18)}
                  />
                ))}
                <text
                  x={392}
                  y={176}
                  fontFamily="Geist Mono, monospace"
                  fontSize={12}
                  letterSpacing="1.5"
                  fill={C.muted}
                  opacity={ghosts}
                >
                  DATA GETS THIN
                </text>
              </svg>
            </Bubble>
            <div
              style={{
                marginTop: 4,
                opacity: interpolate(frame, [T7.chip, T7.chip + 14], [0, 1], { ...clamp, easing: settle }),
              }}
            >
              <MonoTag color={C.clay} border="rgba(191,95,59,0.45)">
                Hints only · Never the answer
              </MonoTag>
            </div>
          </div>
        </MacWindow>
      </div>

      <Kicker at={sec(52.05)} exitAt={sec(67.3)} style={{ position: "absolute", left: 170, top: 160 }}>
        The student&rsquo;s side
      </Kicker>
    </AbsoluteFill>
  );
};
