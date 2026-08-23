import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { clamp, glide } from "../ease";
import { sec } from "../timeline";

// ------------------------------------------------------------------
// One continuous living surface for the whole film.
// Paper + drifting 15° halftone lattice + two slow ink pools that
// re-compose for every scene + static grain + soft vignette.
// A `darkness` ramp hands the stage to the S7 ink cut.
// ------------------------------------------------------------------

type Key = { t: number; v: number };
const track = (frame: number, keys: Key[], easing = glide) => {
  const ts = keys.map((k) => k.t);
  const vs = keys.map((k) => k.v);
  return interpolate(frame, ts, vs, { ...clamp, easing });
};

// pool choreography (global seconds) — each scene gets its own composition
const poolAx: Key[] = [
  { t: sec(0), v: 20 }, { t: sec(7), v: 20 }, { t: sec(9.5), v: 74 },
  { t: sec(16), v: 74 }, { t: sec(18.5), v: 50 }, { t: sec(24), v: 50 },
  { t: sec(27), v: 76 }, { t: sec(50.5), v: 76 }, { t: sec(53.5), v: 24 },
  { t: sec(62), v: 24 }, { t: sec(72.5), v: 50 }, { t: sec(80), v: 50 },
];
const poolAy: Key[] = [
  { t: sec(0), v: 80 }, { t: sec(7), v: 76 }, { t: sec(9.5), v: 24 },
  { t: sec(16), v: 26 }, { t: sec(18.5), v: 86 }, { t: sec(24), v: 84 },
  { t: sec(27), v: 38 }, { t: sec(50.5), v: 42 }, { t: sec(53.5), v: 46 },
  { t: sec(62), v: 48 }, { t: sec(72.5), v: 40 }, { t: sec(80), v: 42 },
];
const poolBx: Key[] = [
  { t: sec(0), v: 84 }, { t: sec(7), v: 84 }, { t: sec(9.5), v: 18 },
  { t: sec(16), v: 18 }, { t: sec(18.5), v: 82 }, { t: sec(24), v: 82 },
  { t: sec(27), v: 16 }, { t: sec(50.5), v: 16 }, { t: sec(53.5), v: 80 },
  { t: sec(62), v: 80 }, { t: sec(72.5), v: 50 }, { t: sec(80), v: 50 },
];
const poolBy: Key[] = [
  { t: sec(0), v: 16 }, { t: sec(7), v: 18 }, { t: sec(9.5), v: 78 },
  { t: sec(16), v: 76 }, { t: sec(18.5), v: 20 }, { t: sec(24), v: 22 },
  { t: sec(27), v: 78 }, { t: sec(50.5), v: 74 }, { t: sec(53.5), v: 18 },
  { t: sec(62), v: 20 }, { t: sec(72.5), v: 88 }, { t: sec(80), v: 88 },
];
const latticeO: Key[] = [
  { t: sec(0), v: 0.06 }, { t: sec(8), v: 0.052 }, { t: sec(17), v: 0.062 },
  { t: sec(25), v: 0.042 }, { t: sec(52), v: 0.048 }, { t: sec(63), v: 0.03 },
  { t: sec(71.5), v: 0.03 }, { t: sec(74), v: 0.058 }, { t: sec(80), v: 0.058 },
];

export const darknessAt = (frame: number) =>
  interpolate(frame, [sec(62.8), sec(63.4), sec(71.2), sec(71.75)], [0, 1, 1, 0], clamp);

export const PaperField: React.FC = () => {
  const frame = useCurrentFrame();
  const dark = darknessAt(frame);
  const lat = track(frame, latticeO) * (1 - dark);

  const ax = track(frame, poolAx);
  const ay = track(frame, poolAy);
  const bx = track(frame, poolBx);
  const by = track(frame, poolBy);
  // slow organic breathing on top of choreography
  const breathe = Math.sin(frame / 190) * 1.6;
  const poolFade = 1 - dark;

  // lattice drift — one slow diagonal walk across the whole film
  const dx = frame * 0.045;
  const dy = frame * 0.028;

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {/* radial paper lift */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 34%, ${C.paperLift} 0%, ${C.paper} 55%, ${C.paperSink} 130%)`,
        }}
      />
      {/* ink pools */}
      <AbsoluteFill
        style={{
          opacity: poolFade,
          background: `radial-gradient(560px 480px at ${ax + breathe}% ${ay}%, rgba(10,31,25,0.075) 0%, rgba(10,31,25,0.028) 46%, rgba(10,31,25,0) 70%),
radial-gradient(430px 380px at ${bx}% ${by - breathe}%, rgba(191,95,59,0.05) 0%, rgba(191,95,59,0) 64%)`,
        }}
      />
      {/* halftone lattice, rotated 15°, drifting — tiled raster cell (cheap) */}
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
      {/* dark hand-off for the thesis cut */}
      <AbsoluteFill style={{ background: C.inkDeep, opacity: dark }} />
      {/* static paper grain */}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("grain.png")})`,
          backgroundSize: "960px 540px",
          mixBlendMode: "soft-light",
          opacity: 0.35,
        }}
      />
      {/* breathing vignette */}
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
