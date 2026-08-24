import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { clamp, glide } from "../ease";
import { sec } from "../timeline";

// One continuous living surface for the whole film (v2, 130s).
// Paper + drifting 15° halftone lattice + two slow ink pools that re-compose
// per scene + static grain + vignette. `darkness` hands the stage to S10.

type Key = { t: number; v: number };
const track = (frame: number, keys: Key[], easing = glide) => {
  const ts = keys.map((k) => k.t);
  const vs = keys.map((k) => k.v);
  return interpolate(frame, ts, vs, { ...clamp, easing });
};

const poolAx: Key[] = [
  { t: sec(0), v: 22 }, { t: sec(4.0), v: 22 }, { t: sec(5.8), v: 74 },
  { t: sec(10.8), v: 74 }, { t: sec(12.4), v: 50 }, { t: sec(16.7), v: 50 },
  { t: sec(18.4), v: 76 }, { t: sec(24.0), v: 76 }, { t: sec(25.8), v: 30 },
  { t: sec(44.7), v: 30 }, { t: sec(46.4), v: 70 }, { t: sec(51.2), v: 70 },
  { t: sec(53.2), v: 26 }, { t: sec(66.4), v: 26 }, { t: sec(68.3), v: 50 },
  { t: sec(73.0), v: 50 }, { t: sec(74.9), v: 64 }, { t: sec(85.2), v: 64 },
  { t: sec(97.2), v: 50 }, { t: sec(110), v: 50 },
];
const poolAy: Key[] = [
  { t: sec(0), v: 78 }, { t: sec(4.0), v: 74 }, { t: sec(5.8), v: 24 },
  { t: sec(10.8), v: 26 }, { t: sec(12.4), v: 86 }, { t: sec(16.7), v: 84 },
  { t: sec(18.4), v: 38 }, { t: sec(24.0), v: 42 }, { t: sec(25.8), v: 40 },
  { t: sec(44.7), v: 44 }, { t: sec(46.4), v: 42 }, { t: sec(51.2), v: 46 },
  { t: sec(53.2), v: 44 }, { t: sec(66.4), v: 48 }, { t: sec(68.3), v: 50 },
  { t: sec(73.0), v: 52 }, { t: sec(74.9), v: 40 }, { t: sec(85.2), v: 44 },
  { t: sec(97.2), v: 40 }, { t: sec(110), v: 42 },
];
const poolBx: Key[] = [
  { t: sec(0), v: 82 }, { t: sec(4.0), v: 82 }, { t: sec(5.8), v: 18 },
  { t: sec(10.8), v: 18 }, { t: sec(12.4), v: 82 }, { t: sec(16.7), v: 82 },
  { t: sec(18.4), v: 16 }, { t: sec(24.0), v: 16 }, { t: sec(25.8), v: 84 },
  { t: sec(44.7), v: 84 }, { t: sec(46.4), v: 22 }, { t: sec(51.2), v: 22 },
  { t: sec(53.2), v: 82 }, { t: sec(66.4), v: 82 }, { t: sec(68.3), v: 50 },
  { t: sec(73.0), v: 50 }, { t: sec(74.9), v: 20 }, { t: sec(85.2), v: 20 },
  { t: sec(97.2), v: 50 }, { t: sec(110), v: 50 },
];
const poolBy: Key[] = [
  { t: sec(0), v: 18 }, { t: sec(4.0), v: 20 }, { t: sec(5.8), v: 78 },
  { t: sec(10.8), v: 76 }, { t: sec(12.4), v: 20 }, { t: sec(16.7), v: 22 },
  { t: sec(18.4), v: 78 }, { t: sec(24.0), v: 74 }, { t: sec(25.8), v: 78 },
  { t: sec(44.7), v: 76 }, { t: sec(46.4), v: 80 }, { t: sec(51.2), v: 78 },
  { t: sec(53.2), v: 20 }, { t: sec(66.4), v: 22 }, { t: sec(68.3), v: 76 },
  { t: sec(73.0), v: 78 }, { t: sec(74.9), v: 74 }, { t: sec(85.2), v: 74 },
  { t: sec(97.2), v: 88 }, { t: sec(110), v: 88 },
];
const latticeO: Key[] = [
  { t: sec(0), v: 0.06 }, { t: sec(4.6), v: 0.052 }, { t: sec(11.6), v: 0.062 },
  { t: sec(17.4), v: 0.042 }, { t: sec(45.4), v: 0.048 }, { t: sec(52), v: 0.05 },
  { t: sec(67.6), v: 0.066 }, { t: sec(73.6), v: 0.046 }, { t: sec(85.4), v: 0.03 },
  { t: sec(96.2), v: 0.03 }, { t: sec(98.5), v: 0.058 }, { t: sec(110), v: 0.058 },
];

export const darknessAt = (frame: number) =>
  interpolate(frame, [sec(85.3), sec(86.1), sec(95.2), sec(96.1)], [0, 1, 1, 0], clamp);

export const PaperField: React.FC = () => {
  const frame = useCurrentFrame();
  const dark = darknessAt(frame);
  const lat = track(frame, latticeO) * (1 - dark);

  const ax = track(frame, poolAx);
  const ay = track(frame, poolAy);
  const bx = track(frame, poolBx);
  const by = track(frame, poolBy);
  const breathe = Math.sin(frame / 190) * 1.6;
  const poolFade = 1 - dark;
  // the friction beat sinks the paper a touch
  const sink = interpolate(frame, [sec(67.6), sec(68.5), sec(72.9), sec(73.6)], [0, 1, 1, 0], clamp);

  const dx = frame * 0.045;
  const dy = frame * 0.028;

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 34%, ${C.paperLift} 0%, ${C.paper} 55%, ${C.paperSink} 130%)`,
        }}
      />
      <AbsoluteFill style={{ background: C.paperSink, opacity: sink * 0.5 }} />
      <AbsoluteFill
        style={{
          opacity: poolFade,
          background: `radial-gradient(560px 480px at ${ax + breathe}% ${ay}%, rgba(10,31,25,0.075) 0%, rgba(10,31,25,0.028) 46%, rgba(10,31,25,0) 70%),
radial-gradient(430px 380px at ${bx}% ${by - breathe}%, rgba(191,95,59,0.05) 0%, rgba(191,95,59,0) 64%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -400,
          top: -400,
          width: 2720,
          height: 1880,
          opacity: lat,
          transform: `rotate(15deg) translate(${dx % 17}px, ${dy % 17}px)`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17'%3E%3Ccircle cx='1.4' cy='1.4' r='1.18' fill='%230a1f19'/%3E%3Ccircle cx='9.9' cy='1.4' r='1.18' fill='%230a1f19'/%3E%3Ccircle cx='1.4' cy='9.9' r='1.18' fill='%230a1f19'/%3E%3Ccircle cx='9.9' cy='9.9' r='1.18' fill='%230a1f19'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
      <AbsoluteFill style={{ background: C.inkDeep, opacity: dark }} />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("grain.png")})`,
          backgroundSize: "960px 540px",
          mixBlendMode: "soft-light",
          opacity: 0.35,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(135% 105% at 50% 46%, rgba(10,31,25,0) 62%, rgba(10,31,25,${
            0.05 + dark * 0.25
          }) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
