import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Line } from "../text/Reveal";
import { C, T } from "../theme";
import { clamp, settle } from "../ease";
import { sec } from "../timeline";

// Close — back on paper. Ends on stillness.
export const S11Close: React.FC = () => {
  const frame = useCurrentFrame();

  const markIn = interpolate(frame, [sec(103.4), sec(104.3)], [0, 1], { ...clamp, easing: settle });
  const rule = interpolate(frame, [sec(105.6), sec(106.3)], [0, 1], { ...clamp, easing: settle });
  const road = interpolate(frame, [sec(107.8), sec(108.4)], [0, 1], { ...clamp, easing: settle });
  const cta = interpolate(frame, [sec(109.0), sec(109.6)], [0, 1], { ...clamp, easing: settle });

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
        <Line at={sec(104.1)} size={128} dur={22} style={{ textAlign: "center" }}>
          Atlas
        </Line>
        <div style={{ height: 26 }} />
        <div style={{ width: 96, height: 2, background: C.clay, transform: `scaleX(${rule})` }} />
        <div style={{ height: 24 }} />
        <Line at={sec(106.2)} size={44} dur={20} weight={440} color={C.inkSoft} style={{ textAlign: "center" }}>
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
