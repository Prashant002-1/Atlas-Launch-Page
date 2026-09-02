import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Line } from "../text/Reveal";
import { InkStroke } from "../ui/handmade";
import { C } from "../theme";
import { clamp, settle } from "../ease";
import { sec } from "../timeline";

// The pivot — hand-inked underline, course-map bearing beneath.
export const S3Pivot: React.FC = () => {
  const frame = useCurrentFrame();

  const draw = interpolate(frame, [sec(11.75), sec(14.1)], [0, 1], { ...clamp, easing: settle });
  const fadeRoute = interpolate(frame, [sec(17.15), sec(17.7)], [1, 0], clamp);

  // underline skeleton under "how it comes in." (line 2 sits ~y588-688; phrase right side)
  const uy = 656;
  const upts: [number, number][] = Array.from({ length: 14 }, (_, i) => [
    1002 + (642 * i) / 13,
    uy + Math.sin(i * 0.9) * 2.2,
  ]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg
        width={1400}
        height={260}
        style={{ position: "absolute", top: 700, left: 260, opacity: 0.5 * fadeRoute }}
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
        <circle cx={1360} cy={96} r={5} fill={C.clay} opacity={interpolate(draw, [0.96, 1], [0, 0.55], clamp)} />
      </svg>

      <div style={{ textAlign: "center", marginTop: -60 }}>
        <Line at={sec(11.65)} size={100} exitAt={sec(17.25)} style={{ textAlign: "center" }}>
          You can&rsquo;t keep AI out.
        </Line>
        <div style={{ height: 26 }} />
        <Line at={sec(12.6)} size={100} exitAt={sec(17.3)} style={{ textAlign: "center", color: C.inkSoft }}>
          You can decide how it comes in.
        </Line>
      </div>

      {/* hand-inked emphasis, drawn like a pen */}
      <svg
        width={1920}
        height={1080}
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(frame, [sec(17.15), sec(17.65)], [1, 0], clamp),
        }}
      >
        <InkStroke points={upts} at={sec(13.6)} dur={13} size={8} color={C.ink} opacity={0.9} />
      </svg>
    </AbsoluteFill>
  );
};
