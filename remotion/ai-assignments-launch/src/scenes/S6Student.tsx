import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { Bubble, IndicatorRow, MonoTag } from "../ui/bits";
import { C, PAD_X, T } from "../theme";
import { clamp, settle, exitIn } from "../ease";
import { sec } from "../timeline";

// The student's side — the work happens in conversation; the teacher gets signal.
export const S6Student: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = sec(52);

  const winIn = interpolate(frame, [t0 + 14, t0 + 44], [0, 1], { ...clamp, easing: settle });
  const cardIn = interpolate(frame, [sec(58.4), sec(59.4)], [0, 1], { ...clamp, easing: settle });
  const out = interpolate(frame, [sec(62.3), sec(63)], [0, 1], { ...clamp, easing: exitIn });

  const timer =
    frame < t0 + 120 ? "38:04" : frame < t0 + 210 ? "37:41" : frame < t0 + 290 ? "37:12" : "36:48";

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

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {/* contour rings behind the signal card — orientation motif */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(1468, 520)" opacity={cardIn * 0.35}>
          {ring(300, 0.16, 0)}
          {ring(392, 0.10, 1.4)}
        </g>
      </svg>

      {/* student window */}
      <div
        style={{
          position: "absolute",
          left: 170,
          top: 268,
          opacity: winIn,
          transform: `translateY(${(1 - winIn) * 60}px)`,
        }}
      >
        <MacWindow
          title="AI Assignment"
          width={660}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <Bubble at={t0 + 44} who="agent">
              Before anything else — what&rsquo;s your claim, in one sentence?
            </Bubble>
            <Bubble at={t0 + 92} who="student">
              That the model breaks when the data gets thin.
            </Bubble>
            <Bubble at={t0 + 150} who="agent">
              Good. What evidence would change your mind?
            </Bubble>
            <div
              style={{
                marginTop: 6,
                opacity: interpolate(frame, [t0 + 196, t0 + 212], [0, 1], { ...clamp, easing: settle }),
              }}
            >
              <MonoTag color={C.clay} border="rgba(191,95,59,0.45)">
                Socratic · answers withheld
              </MonoTag>
            </div>
          </div>
        </MacWindow>
      </div>

      {/* signal card — what returns to the teacher */}
      <div
        style={{
          position: "absolute",
          left: 1200,
          top: 356,
          width: 540,
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 44}px)`,
          background: C.paperLift,
          boxShadow: "0 0 0 1px rgba(10,31,25,0.12), 0 22px 52px rgba(10,31,25,0.09)",
          padding: "26px 30px 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ width: 11, height: 11, background: C.clay }} />
          <span style={{ ...T.label, fontSize: 14, color: C.inkSoft }}>Back to you</span>
          <span style={{ ...T.label, fontSize: 11.5, color: C.muted, marginLeft: "auto" }}>
            per student · per assignment
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 21 }}>
          <IndicatorRow at={sec(59.0)} label="Claim formation" fill={0.78} />
          <IndicatorRow at={sec(59.45)} label="Evidence use" fill={0.56} />
          <IndicatorRow at={sec(59.9)} label="Revision depth" fill={0.7} />
        </div>
      </div>

      {/* the line */}
      <div style={{ position: "absolute", left: PAD_X, top: 872 }}>
        <Line at={sec(59.8)} size={62}>
          The conversation is the work. <span style={{ color: C.muted }}>And the evidence.</span>
        </Line>
      </div>

      <Kicker at={t0 + 18} exitAt={sec(62.2)} style={{ position: "absolute", left: PAD_X, top: 190 }}>
        The student&rsquo;s side
      </Kicker>
    </AbsoluteFill>
  );
};
