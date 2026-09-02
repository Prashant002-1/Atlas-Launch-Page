import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Line } from "../text/Reveal";
import { C, T } from "../theme";
import { clamp, settle } from "../ease";
import { sec } from "../timeline";

// Close — back on paper. Ends on stillness.
export const S11Close: React.FC = () => {
  const frame = useCurrentFrame();

  const markIn = interpolate(frame, [sec(95.9), sec(96.7)], [0, 1], { ...clamp, easing: settle });
  const rule = interpolate(frame, [sec(98.3), sec(98.9)], [0, 1], { ...clamp, easing: settle });
  const road = interpolate(frame, [sec(100.5), sec(101.0)], [0, 1], { ...clamp, easing: settle });
  const cta = interpolate(frame, [sec(101.7), sec(102.2)], [0, 1], { ...clamp, easing: settle });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -30 }}>
        <Img
          src={staticFile("brand/atlas-mark.svg")}
          style={{
            width: 118,
            height: 118,
            opacity: markIn,
            transform: `translateY(${(1 - markIn) * 26}px) scale(${0.92 + markIn * 0.08})`,
          }}
        />
        <div style={{ height: 34 }} />
        <Line at={sec(96.5)} size={128} dur={18} style={{ textAlign: "center" }}>
          Atlas
        </Line>
        <div style={{ height: 26 }} />
        <div style={{ width: 96, height: 2, background: C.clay, transform: `scaleX(${rule})` }} />
        <div style={{ height: 24 }} />
        <Line at={sec(98.9)} size={44} weight={440} color={C.inkSoft} style={{ textAlign: "center" }}>
          AI Assignments
        </Line>
        <div style={{ height: 46 }} />
        <div style={{ ...T.label, fontSize: 16.5, color: C.muted, opacity: road }}>
          Assignments first · assessments next
        </div>
        <div style={{ height: 30 }} />
        <div
          style={{
            ...T.label,
            fontSize: 14.5,
            color: C.paperLift,
            background: C.ink,
            padding: "13px 26px",
            opacity: cta,
            transform: `translateY(${(1 - cta) * 12}px)`,
          }}
        >
          Request access
        </div>
      </div>
    </AbsoluteFill>
  );
};
