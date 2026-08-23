import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Line, SerifI } from "../text/Reveal";
import { C, PAD_X } from "../theme";
import { clamp, exitIn } from "../ease";
import { sec } from "../timeline";

// The one dark cut — an engraved course-map plate (clay on ink paper),
// drifting like an archival scan under the thesis. No footage, no gimmicks.
export const S7Thesis: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const abs = frame + from;

  const plateIn = interpolate(abs, [sec(63), sec(64.1)], [0, 1], clamp);
  const plateOut = interpolate(abs, [sec(70.6), sec(71.5)], [1, 0], { ...clamp, easing: exitIn });
  // barely-perceptible archival drift
  const drift = interpolate(abs, [sec(63), sec(71.5)], [0, 1], clamp);
  const scale = 1.0 + drift * 0.05;
  const tx = drift * -26;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: plateIn * plateOut }}>
        {/* the plate */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${scale}) translateX(${tx}px)`,
            transformOrigin: "72% 50%",
          }}
        >
          <Img
            src={staticFile("thesis-plate.jpg")}
            style={{ position: "absolute", width: 2304, left: -300, top: -103, opacity: 0.96 }}
          />
        </div>
        {/* reading-zone scrim */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(97deg, rgba(7,23,18,0.92) 24%, rgba(7,23,18,0.55) 45%, rgba(7,23,18,0.06) 68%, rgba(7,23,18,0) 82%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(125% 105% at 50% 50%, rgba(7,23,18,0) 58%, rgba(7,23,18,0.5) 100%)`,
          }}
        />
      </AbsoluteFill>

      <div style={{ position: "absolute", left: PAD_X, top: 296 }}>
        <Line at={sec(63.6) - from} size={90} color={C.paper} exitAt={sec(70.8) - from}>
          This was never about
        </Line>
        <Line at={sec(64.2) - from} size={90} color={C.paper} exitAt={sec(70.85) - from}>
          preventing AI.
        </Line>
        <div style={{ height: 40 }} />
        <Line at={sec(66.4) - from} size={90} color="rgba(241,244,238,0.72)" exitAt={sec(70.9) - from}>
          It&rsquo;s about teaching with it.
        </Line>
        <div style={{ height: 46 }} />
        <Line at={sec(69.0) - from} size={112} exitAt={sec(71.0) - from}>
          <SerifI color={C.clay}>Deliberately.</SerifI>
        </Line>
      </div>
    </AbsoluteFill>
  );
};
