import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Line } from "../text/Reveal";
import { C } from "../theme";
import { clamp, settle } from "../ease";
import { sec } from "../timeline";

// The pivot — centered, editorial. Emphasis is an animated ink underline,
// same face, same color. A course-map bearing draws beneath.
export const S3Pivot: React.FC = () => {
  const frame = useCurrentFrame();

  const draw = interpolate(frame, [sec(15.0), sec(18.3)], [0, 1], { ...clamp, easing: settle });
  const fadeRoute = interpolate(frame, [sec(20.9), sec(21.5)], [1, 0], clamp);
  const under = interpolate(frame, [sec(17.6), sec(18.5)], [0, 1], { ...clamp, easing: settle });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg
        width={1400}
        height={260}
        style={{ position: "absolute", top: 700, opacity: 0.5 * fadeRoute }}
      >
        <defs>
          <mask id="routeMask">
            <path
              d="M60,190 C360,110 620,214 830,150 S1220,60 1360,96"
              stroke="#fff"
              strokeWidth={10}
              fill="none"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * (1 - draw)}
            />
          </mask>
        </defs>
        <path
          d="M60,190 C360,110 620,214 830,150 S1220,60 1360,96"
          stroke={C.inkSoft}
          strokeOpacity={0.34}
          strokeWidth={1.8}
          strokeDasharray="7 9"
          fill="none"
          mask="url(#routeMask)"
        />
        <circle cx={60} cy={190} r={5} fill={C.clay} opacity={draw > 0.02 ? 0.55 : 0} />
        <circle
          cx={1360}
          cy={96}
          r={5}
          fill={C.clay}
          opacity={interpolate(draw, [0.96, 1], [0, 0.55], clamp)}
        />
      </svg>

      <div style={{ textAlign: "center", marginTop: -60 }}>
        <Line at={sec(14.9)} size={100} exitAt={sec(20.9)} style={{ textAlign: "center" }}>
          You can&rsquo;t keep AI out.
        </Line>
        <div style={{ height: 26 }} />
        <Line at={sec(16.5)} size={100} exitAt={sec(21.0)} style={{ textAlign: "center", color: C.inkSoft }}>
          You can decide{" "}
          <span style={{ position: "relative", display: "inline-block" }}>
            how it comes in.
            <span
              style={{
                position: "absolute",
                left: "0.04em",
                right: "0.1em",
                bottom: "0.02em",
                height: 5,
                background: C.ink,
                transform: `scaleX(${under})`,
                transformOrigin: "left center",
              }}
            />
          </span>
        </Line>
      </div>
    </AbsoluteFill>
  );
};
