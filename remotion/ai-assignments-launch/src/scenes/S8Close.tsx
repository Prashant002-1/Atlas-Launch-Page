import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Line } from "../text/Reveal";
import { C, T } from "../theme";
import { clamp, settle } from "../ease";
import { sec } from "../timeline";

// Close — back on paper, where the product lives. Ends on stillness.
export const S8Close: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const at = (s: number) => sec(s) - from;

  const markIn = interpolate(frame, [at(71.55), at(72.45)], [0, 1], { ...clamp, easing: settle });
  const rule = interpolate(frame, [at(73.2), at(73.9)], [0, 1], { ...clamp, easing: settle });
  const road = interpolate(frame, [at(75.4), at(76.0)], [0, 1], { ...clamp, easing: settle });
  const cta = interpolate(frame, [at(76.6), at(77.2)], [0, 1], { ...clamp, easing: settle });

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
        <Line at={at(72.1)} size={128} style={{ textAlign: "center" }}>
          Atlas
        </Line>
        <div style={{ height: 26 }} />
        <div style={{ width: 96, height: 2, background: C.clay, transform: `scaleX(${rule})` }} />
        <div style={{ height: 24 }} />
        <Line at={at(73.7)} size={44} weight={440} color={C.inkSoft} style={{ textAlign: "center" }}>
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
