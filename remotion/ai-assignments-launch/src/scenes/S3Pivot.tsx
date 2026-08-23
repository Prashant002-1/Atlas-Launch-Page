import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Line, SerifI } from "../text/Reveal";
import { C } from "../theme";
import { clamp, settle } from "../ease";
import { sec } from "../timeline";

// The pivot — centered, editorial. A course-map bearing draws beneath.
export const S3Pivot: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = sec(17);

  const draw = interpolate(frame, [t0 + 30, t0 + 130], [0, 1], { ...clamp, easing: settle });
  const fadeRoute = interpolate(frame, [sec(24.2), sec(24.9)], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* dashed route with two waypoints — orientation, not decoration */}
      <svg
        width={1400}
        height={260}
        style={{ position: "absolute", top: 700, opacity: 0.5 * fadeRoute }}
      >
        <defs>
          {/* draw-on reveal for a dashed path: a solid path wipes inside a mask */}
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
        <Line at={t0 + 24} size={100} exitAt={sec(24.3)} style={{ textAlign: "center" }}>
          You can&rsquo;t keep AI out.
        </Line>
        <div style={{ height: 26 }} />
        <Line at={t0 + 96} size={100} exitAt={sec(24.4)} style={{ textAlign: "center", color: C.inkSoft }}>
          You can decide <SerifI color={C.clay}>how it comes in.</SerifI>
        </Line>
      </div>
    </AbsoluteFill>
  );
};
