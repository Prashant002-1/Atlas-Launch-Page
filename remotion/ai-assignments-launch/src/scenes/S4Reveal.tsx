import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line, Words } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { AssignRow } from "../ui/bits";
import { C, PAD_X, T } from "../theme";
import { clamp, glide, settle, exitIn } from "../ease";
import { sec } from "../timeline";

// The reveal — a new assignment type, beside the ones you already give.
export const S4Reveal: React.FC = () => {
  const frame = useCurrentFrame();

  const winIn = interpolate(frame, [sec(24.4), sec(25.3)], [0, 1], { ...clamp, easing: settle });
  const out = interpolate(frame, [sec(29.8), sec(30.4)], [0, 1], { ...clamp, easing: exitIn });
  const segIdx = interpolate(frame, [sec(26.2), sec(26.75)], [0, 3], { ...clamp, easing: glide });
  const segW = 146;
  const options = ["ESSAY", "PROBLEM SET", "QUIZ", "AI ASSIGNMENT"];

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div style={{ position: "absolute", left: PAD_X, top: 306 }}>
        <Kicker at={sec(22.0)} exitAt={sec(29.7)}>
          A new assignment type
        </Kicker>
        <div style={{ height: 30 }} />
        <Line at={sec(22.5)} size={120} exitAt={sec(29.75)}>
          AI Assignments.
        </Line>
        <div style={{ height: 40 }} />
        <Words
          at={sec(26.9)}
          size={33}
          color={C.muted}
          exitAt={sec(29.7)}
          text="Right beside the ones you already give."
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 1088,
          top: 268,
          opacity: winIn,
          transform: `translateY(${(1 - winIn) * 64}px)`,
        }}
      >
        <MacWindow title="New assignment" width={680}>
          <div
            style={{
              position: "relative",
              display: "flex",
              border: "1px solid rgba(10,31,25,0.16)",
              height: 46,
              marginBottom: 22,
              background: C.paper,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                bottom: 3,
                left: 3 + segIdx * (segW + 4.5),
                width: segW,
                background: C.ink,
              }}
            />
            {options.map((o, i) => (
              <div
                key={o}
                style={{
                  width: segW + 4.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...T.label,
                  fontSize: 12.5,
                  color: Math.abs(segIdx - i) < 0.5 ? C.paperLift : C.muted,
                  position: "relative",
                }}
              >
                {o}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <AssignRow at={sec(26.9)} tag="Essay" barW={280} />
            <AssignRow at={sec(27.3)} tag="Quiz" barW={224} />
            <AssignRow
              at={sec(27.7)}
              tag="AI Assignment"
              tagColor={C.clay}
              tagBorder="rgba(191,95,59,0.5)"
              barW={318}
              active
            />
          </div>
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
};
