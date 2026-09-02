import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { Bubble, ClassDots } from "../ui/bits";
import { C, F, T } from "../theme";
import { clamp, glide, settle, exitIn } from "../ease";
import { T6, sec } from "../timeline";

// no icons, no ticks: the rubric is just the teacher's words, distilled
const RubricRow: React.FC<{ at: number; k: string; v: string; accent?: boolean }> = ({ at, k, v, accent }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 13], [0, 1], { ...clamp, easing: settle });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        opacity: p,
        transform: `translateX(${(1 - p) * 16}px)`,
      }}
    >
      <span style={{ ...T.label, fontSize: 13, color: C.muted, width: 132, flex: "none" }}>{k}</span>
      <span
        style={{
          fontFamily: F.sans,
          fontSize: 19.5,
          fontWeight: 440,
          color: accent ? C.clay : C.ink,
          letterSpacing: "-0.01em",
        }}
      >
        {v}
      </span>
    </div>
  );
};

export const S6Rubric: React.FC = () => {
  const frame = useCurrentFrame();

  const ackWin = interpolate(frame, [sec(47.6), sec(48.2)], [0, 1], { ...clamp, easing: settle });
  const cardIn = interpolate(frame, [T6.card, T6.card + 22], [0, 1], { ...clamp, easing: settle });
  const linkDraw = interpolate(frame, [T6.link, T6.link + 24], [0, 1], { ...clamp, easing: glide });
  const pulse = interpolate(frame, [T6.link + 30, T6.link + 58], [0, 1], clamp);
  const out = interpolate(frame, [T6.exit, T6.exit + 18], [0, 1], { ...clamp, easing: exitIn });
  const shipPulse =
    1 + 0.018 * Math.sin(interpolate(frame, [T6.fanout, T6.fanout + 20], [0, Math.PI], clamp));

  // captions under the class
  const cap1 = interpolate(frame, [T6.cap1, T6.cap1 + 14], [0, 1], { ...clamp, easing: settle });
  const capSwap = interpolate(frame, [T6.cap2, T6.cap2 + 12], [0, 1], { ...clamp, easing: settle });

  const fanN = 26;
  const dotsCx = 960;
  const dotsCy = 878;
  const spread = 1260;

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {/* fan + link, behind everything */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path
          d="M 756 520 C 930 520 1030 520 1204 520"
          stroke={C.ink}
          strokeOpacity={0.16}
          strokeWidth={1.6}
          fill="none"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 * (1 - linkDraw)}
        />
        {pulse > 0 && pulse < 1 && (
          <circle cx={756 + 448 * pulse} cy={520} r={5} fill={C.clay} opacity={Math.sin(pulse * Math.PI)} />
        )}
        {Array.from({ length: fanN }).map((_, i) => {
          const x = dotsCx - spread / 2 + (spread / (fanN - 1)) * i;
          const y = dotsCy + Math.sin((i / (fanN - 1)) * Math.PI) * -26;
          const at = T6.fanout + i * 1.0;
          const p = interpolate(frame, [at, at + 15], [0, 1], { ...clamp, easing: glide });
          return (
            <path
              key={i}
              d={`M 1487 608 Q ${(1487 + x) / 2} 690, ${x} ${y}`}
              stroke={C.clay}
              strokeOpacity={0.16 * p}
              strokeWidth={1.2}
              fill="none"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * (1 - p)}
            />
          );
        })}
      </svg>

      {/* compact course window, arrived from the ramble */}
      <div style={{ position: "absolute", left: 150, top: 360, opacity: ackWin }}>
        <MacWindow title="Course agent" width={606}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Bubble at={T6.ack} who="agent" width="88%">
              On it. Building your assignment agent.
            </Bubble>
          </div>
        </MacWindow>
      </div>

      {/* the agent rubric */}
      <div
        style={{
          position: "absolute",
          left: 1204,
          top: 252,
          width: 566,
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 44}px) scale(${shipPulse})`,
          background: C.paperLift,
          boxShadow: "0 0 0 1px rgba(10,31,25,0.14), 0 22px 52px rgba(10,31,25,0.09)",
          padding: "26px 30px 30px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <span style={{ width: 11, height: 11, background: C.clay }} />
          <span style={{ ...T.label, fontSize: 14, color: C.inkSoft }}>Agent rubric</span>
          <span style={{ ...T.label, fontSize: 11.5, color: C.muted, marginLeft: "auto" }}>
            distilled from your words
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <RubricRow at={T6.rows[0]} k="Personality" v="Curious, a little playful" />
          <RubricRow at={T6.rows[1]} k="Method" v="Analogies first, 3Blue1Brown style" />
          <RubricRow at={T6.rows[2]} k="Visuals" v="Sketches it when seeing helps" />
          <RubricRow at={T6.rows[3]} k="Boundary" v="Hints only. Never the answer." accent />
          <RubricRow at={T6.rows[4]} k="Sources" v="Course readings, cited" />
          <RubricRow at={T6.rows[5]} k="Applied" v="Real examples, thesis tested" />
          <RubricRow at={T6.rows[6]} k="Context" v="Midterm problem 7 follow up" />
        </div>
      </div>

      {/* headline, then the money line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 122, textAlign: "center" }}>
        <Line at={T6.headline} size={58} exitAt={T6.headlineOut} style={{ textAlign: "center" }}>
          Your rubric. Your agent. No two alike.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 122, textAlign: "center" }}>
        <Line at={T6.bigLine} size={60} exitAt={T6.exit} style={{ textAlign: "center" }}>
          Your agent builds the agent your students meet.
        </Line>
      </div>

      <ClassDots at={T6.fanout + 4} cx={dotsCx} cy={dotsCy} spread={spread} />
      <div style={{ position: "absolute", left: 0, right: 0, top: dotsCy + 42, height: 30 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            ...T.label,
            fontSize: 15,
            color: C.muted,
            opacity: cap1 * (1 - capSwap),
          }}
        >
          Personal for each student
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            ...T.label,
            fontSize: 15,
            color: C.muted,
            opacity: capSwap,
          }}
        >
          Every conversation recorded
        </div>
      </div>

      <Kicker at={sec(48.0)} exitAt={T6.bigLine - 2} style={{ position: "absolute", left: 150, top: 190 }}>
        One agent configures another
      </Kicker>
    </AbsoluteFill>
  );
};
