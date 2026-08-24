import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line, Words } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { AssignRow } from "../ui/bits";
import { RoughNote } from "../ui/handmade";
import { C, PAD_X, T } from "../theme";
import { clamp, glide, settle, exitIn } from "../ease";
import { sec } from "../timeline";

// The reveal — and the teacher's pen circles the new type.
export const S4Reveal: React.FC = () => {
  const frame = useCurrentFrame();

  const winIn = interpolate(frame, [sec(21.9), sec(22.6)], [0, 1], { ...clamp, easing: settle });
  const out = interpolate(frame, [sec(27.1), sec(27.6)], [0, 1], { ...clamp, easing: exitIn });
  const segIdx = interpolate(frame, [sec(23.3), sec(23.8)], [0, 3], { ...clamp, easing: glide });
  const segW = 146;
  const options = ["ESSAY", "PROBLEM SET", "QUIZ", "AI ASSIGNMENT"];

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div style={{ position: "absolute", left: PAD_X, top: 306 }}>
        <Kicker at={sec(19.9)} dur={14} exitAt={sec(27.0)}>
          A new assignment type
        </Kicker>
        <div style={{ height: 30 }} />
        <Line at={sec(20.3)} size={120} dur={20} exitAt={sec(27.05)}>
          AI Assignments.
        </Line>
        <div style={{ height: 40 }} />
        <Words
          at={sec(24.6)}
          gapFrames={3}
          size={33}
          color={C.muted}
          exitAt={sec(27.0)}
          text="Right beside the ones you already give."
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 1088,
          top: 268,
          opacity: winIn,
          transform: `translateY(${(1 - winIn) * 56}px)`,
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
            {/* the teacher's pen circles the choice */}
            <svg width={680} height={140} style={{ position: "absolute", left: -30, top: -50, overflow: "visible", pointerEvents: "none" }}>
              <RoughNote kind="circle" x={478} y={38} w={192} h={54} at={sec(24.2)} dur={14} seed={11} strokeWidth={2.2} />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <AssignRow at={sec(23.9)} tag="Essay" barW={280} />
            <AssignRow at={sec(24.2)} tag="Quiz" barW={224} />
            <AssignRow
              at={sec(24.5)}
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
