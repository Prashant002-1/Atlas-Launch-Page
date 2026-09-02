import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Line } from "../text/Reveal";
import { ClassDots } from "../ui/bits";
import { C, F, T } from "../theme";
import { clamp, glide, settle, exitIn } from "../ease";
import { T6, sec } from "../timeline";

// Ship — the rubric card compacts center-right, then fans to the class.
export const S6Ship: React.FC = () => {
  const frame = useCurrentFrame();

  const cardIn = interpolate(frame, [sec(45.4), sec(45.8)], [0, 1], clamp);
  const out = interpolate(frame, [T6.exit, T6.exit + 14], [0, 1], { ...clamp, easing: exitIn });
  const ship = 1 + 0.02 * Math.sin(interpolate(frame, [T6.fanout, T6.fanout + 18], [0, Math.PI], clamp));
  const cap1 = interpolate(frame, [T6.cap1, T6.cap1 + 12], [0, 1], { ...clamp, easing: settle });
  const capSwap = interpolate(frame, [T6.cap2, T6.cap2 + 10], [0, 1], { ...clamp, easing: settle });

  const fanN = 26;
  const dotsCx = 960;
  const dotsCy = 852;
  const spread = 1300;
  const cardX = 1280, cardY = 224, cardW = 500, cardB = 224 + 168;

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: fanN }).map((_, i) => {
          const x = dotsCx - spread / 2 + (spread / (fanN - 1)) * i;
          const y = dotsCy + Math.sin((i / (fanN - 1)) * Math.PI) * -24;
          const at = T6.fanout + i * 0.9;
          const p = interpolate(frame, [at, at + 13], [0, 1], { ...clamp, easing: glide });
          return (
            <path
              key={i}
              d={`M ${cardX + cardW / 2} ${cardB} Q ${(cardX + cardW / 2 + x) / 2} ${cardB + 120}, ${x} ${y}`}
              stroke={C.clay}
              strokeOpacity={0.17 * p}
              strokeWidth={1.2}
              fill="none"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * (1 - p)}
            />
          );
        })}
      </svg>

      {/* the compact rubric capsule (echo of the build card) */}
      <div
        style={{
          position: "absolute",
          left: cardX,
          top: cardY,
          width: cardW,
          opacity: cardIn,
          transform: `scale(${ship})`,
          background: C.paperLift,
          border: "1px solid rgba(10,31,25,0.18)",
          padding: "22px 26px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <span style={{ ...T.label, fontSize: 14, color: C.inkSoft }}>Rubric</span>
        </div>
        <div style={{ fontFamily: F.sans, fontSize: 19, color: C.ink, letterSpacing: "-0.01em", lineHeight: 1.55 }}>
          One agent per student.
          <br />
          <span style={{ color: C.clay }}>Every one carries your rubric.</span>
        </div>
      </div>

      <ClassDots at={T6.dots} cx={dotsCx} cy={dotsCy} spread={spread} />

      <div style={{ position: "absolute", left: 0, right: 0, top: dotsCy + 40, height: 30 }}>
        <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", ...T.label, fontSize: 15, color: C.muted, opacity: cap1 * (1 - capSwap) }}>
          Personal for each student
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", ...T.label, fontSize: 15, color: C.muted, opacity: capSwap }}>
          Every conversation recorded
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
        <Line at={T6.bigLine} size={60} dur={18} exitAt={T6.exit} style={{ textAlign: "center" }}>
          Your agent builds the agent your students meet.
        </Line>
        <div style={{ height: 14 }} />
        <Line at={T6.bigLine + 16} size={40} dur={16} color={C.inkSoft} exitAt={T6.exit + 1} style={{ textAlign: "center" }}>
          And works with each one.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
