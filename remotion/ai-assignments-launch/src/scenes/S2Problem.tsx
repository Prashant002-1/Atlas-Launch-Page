import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Line, Words } from "../text/Reveal";
import { Shimmer } from "../ui/bits";
import { C, PAD_X, T } from "../theme";
import { clamp, settle, exitIn, rand } from "../ease";
import { sec } from "../timeline";

// The problem — a polished page in front, the thinking dissolving behind it.
export const S2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = sec(8);

  const sheetIn = interpolate(frame, [t0 + 48, t0 + 78], [0, 1], { ...clamp, easing: settle });
  const sheetOut = interpolate(frame, [sec(16.4), sec(16.9)], [0, 1], { ...clamp, easing: exitIn });
  const float = Math.sin((frame - t0) / 52) * 5;

  // the thinking — pencil gestures that surface, then dissolve
  const strokes = [
    { d: "M0,120 C120,40 220,190 340,110 S560,60 640,130", at: t0 + 78 },
    { d: "M20,260 C160,210 240,330 400,260 S600,220 660,280", at: t0 + 96 },
    { d: "M10,410 C130,360 300,470 430,400 S610,370 650,420", at: t0 + 114 },
  ];
  const dissolve = interpolate(frame, [sec(13.6), sec(15.6)], [1, 0], { ...clamp, easing: exitIn });

  const lineW = [420, 452, 388, 430, 300, 444, 412, 340, 424, 208, 436, 372, 448, 296];

  return (
    <AbsoluteFill>
      {/* left column — the claim */}
      <div style={{ position: "absolute", left: PAD_X, top: 392, width: 930 }}>
        <Line at={t0 + 36} size={86} exitAt={sec(16.4)}>
          The answer stopped
        </Line>
        <Line at={t0 + 48} size={86} exitAt={sec(16.45)}>
          showing the thinking.
        </Line>
        <div style={{ height: 44 }} />
        <Words at={sec(12.4)} size={33} color={C.muted} exitAt={sec(16.3)} text="So grading became guessing." />
      </div>

      {/* right — the artifact */}
      <div
        style={{
          position: "absolute",
          left: 1128,
          top: 208,
          opacity: sheetIn * (1 - sheetOut),
          transform: `translateY(${(1 - sheetIn) * 60 + float - sheetOut * 40}px)`,
        }}
      >
        {/* the thinking, behind */}
        <svg
          width={680}
          height={520}
          style={{ position: "absolute", left: -66, top: 44, opacity: 0.42 * dissolve }}
        >
          {strokes.map((s, i) => {
            const p = interpolate(frame, [s.at, s.at + 34], [0, 1], { ...clamp, easing: settle });
            return (
              <path
                key={i}
                d={s.d}
                stroke={C.inkSoft}
                strokeWidth={2.4}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={900}
                strokeDashoffset={900 * (1 - p)}
                opacity={0.6 + rand(i) * 0.2}
              />
            );
          })}
        </svg>

        {/* the polished page, front */}
        <div
          style={{
            position: "relative",
            width: 540,
            height: 640,
            background: C.paperLift,
            boxShadow: "0 0 0 1px rgba(10,31,25,0.10), 0 28px 64px rgba(10,31,25,0.10)",
            padding: "52px 48px",
            display: "flex",
            flexDirection: "column",
            gap: 21,
          }}
        >
          <div style={{ ...T.label, fontSize: 13, color: C.muted, marginBottom: 14 }}>
            Submitted · on time
          </div>
          {lineW.map((w, i) => {
            const at = t0 + 84 + i * 4;
            const p = interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: settle });
            return <Shimmer key={i} w={w * p} tone={i === 0 ? "#cfdacb" : "#dde5d9"} h={i === 0 ? 16 : 11} />;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
