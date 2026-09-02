import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Line } from "../text/Reveal";
import { Shimmer } from "../ui/bits";
import { C, PAD_X, T } from "../theme";
import { clamp, settle, exitIn } from "../ease";
import { sec } from "../timeline";

// The problem, stated plainly: the polished page is the AI's work.
export const S2Problem: React.FC = () => {
  const frame = useCurrentFrame();

  const sheetIn = interpolate(frame, [sec(5.0), sec(5.7)], [0, 1], { ...clamp, easing: settle });
  const sheetOut = interpolate(frame, [sec(11.3), sec(11.8)], [0, 1], { ...clamp, easing: exitIn });
  const float = Math.sin((frame - sec(4.6)) / 52) * 5;

  const lineW = [420, 452, 388, 430, 300, 444, 412, 340, 424, 208, 436, 372, 448, 296];

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: PAD_X, top: 392, width: 930 }}>
        <Line at={sec(4.65)} size={90} exitAt={sec(11.45)}>
          You&rsquo;re grading
        </Line>
        <Line at={sec(4.9)} size={90} exitAt={sec(11.5)}>
          the AI&rsquo;s work.
        </Line>
        <div style={{ height: 30 }} />
        <Line at={sec(6.7)} size={90} color={C.inkSoft} exitAt={sec(11.55)}>
          Not the student&rsquo;s.
        </Line>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1128,
          top: 208,
          opacity: sheetIn * (1 - sheetOut),
          transform: `translateY(${(1 - sheetIn) * 60 + float - sheetOut * 40}px)`,
        }}
      >
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
            const at = sec(6.0) + i * 2.0;
            const p = interpolate(frame, [at, at + 9], [0, 1], { ...clamp, easing: settle });
            return <Shimmer key={i} w={w * p} tone={i === 0 ? "#cfdacb" : "#dde5d9"} h={i === 0 ? 16 : 11} />;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
