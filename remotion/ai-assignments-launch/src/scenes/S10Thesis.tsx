import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Line } from "../text/Reveal";
import { C, PAD_X } from "../theme";
import { clamp, exitIn } from "../ease";
import { sec } from "../timeline";

// The one dark cut — thesis, then the order.
export const S10Thesis: React.FC = () => {
  const frame = useCurrentFrame();

  const plateIn = interpolate(frame, [sec(106.0), sec(107.0)], [0, 1], clamp);
  const plateOut = interpolate(frame, [sec(115.1), sec(116.0)], [1, 0], { ...clamp, easing: exitIn });
  const drift = interpolate(frame, [sec(106), sec(116.4)], [0, 1], clamp);
  const scale = 1.0 + drift * 0.05;
  const tx = drift * -26;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: plateIn * plateOut }}>
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
        <AbsoluteFill
          style={{
            background: `linear-gradient(97deg, ${C.inkDeep} 24%, rgba(7,23,18,0.82) 45%, rgba(7,23,18,0.06) 68%, rgba(7,23,18,0) 82%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(125% 105% at 50% 50%, rgba(7,23,18,0) 58%, rgba(7,23,18,0.5) 100%)`,
          }}
        />
      </AbsoluteFill>

      {/* thesis */}
      <div style={{ position: "absolute", left: PAD_X, top: 330 }}>
        <Line at={sec(106.7)} size={88} color={C.paper} exitAt={sec(111.3)}>
          This was never about
        </Line>
        <Line at={sec(107.1)} size={88} color={C.paper} exitAt={sec(111.35)}>
          preventing AI.
        </Line>
        <div style={{ height: 38 }} />
        <Line at={sec(109.0)} size={88} color="rgba(241,244,238,0.72)" exitAt={sec(111.4)}>
          It&rsquo;s about teaching with it.
        </Line>
      </div>

      {/* the order */}
      <div style={{ position: "absolute", left: PAD_X, top: 400 }}>
        <Line at={sec(112.0)} size={106} color={C.paper} exitAt={sec(115.4)}>
          Stop detecting AI.
        </Line>
        <div style={{ height: 26 }} />
        <Line at={sec(113.9)} size={106} color={C.paper} exitAt={sec(115.5)}>
          Start assigning it.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
