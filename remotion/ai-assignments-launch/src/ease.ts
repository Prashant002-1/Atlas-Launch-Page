import { Easing, interpolate } from "remotion";

// the one curve to memorize: fast out, long settle
export const settle = Easing.bezier(0.16, 1, 0.3, 1);
export const glide = Easing.bezier(0.45, 0, 0.22, 1); // for repositions
export const exitIn = Easing.bezier(0.5, 0, 0.9, 0.4);

export const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** 0→1 progress over [start, start+dur] with settle ease */
export const rise = (frame: number, start: number, dur = 14) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: settle });

/** linear 0→1 */
export const lin = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], clamp);

/** enter/exit opacity envelope for a whole scene */
export const envelope = (frame: number, from: number, to: number, inDur = 12, outDur = 12) => {
  const a = interpolate(frame, [from, from + inDur], [0, 1], { ...clamp, easing: settle });
  const b = interpolate(frame, [to - outDur, to], [1, 0], { ...clamp, easing: exitIn });
  return Math.min(a, b);
};

/** deterministic pseudo-random in [0,1) from integer seed */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
