import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp } from "../ease";

// Baked p5.brush plates — each one paints itself on (26-step sequences).
export const Plate: React.FC<{
  name: "flow" | "arcs" | "gestures";
  at: number;
  x: number;
  y: number;
  w: number;
  exitAt?: number;
  drift?: number;
  opacity?: number;
  flip?: boolean;
  drawFrames?: number;
}> = ({ name, at, x, y, w, exitAt, drift = 1, opacity = 0.9, flip, drawFrames = 46 }) => {
  const frame = useCurrentFrame();
  const idx = Math.round(interpolate(frame, [at, at + drawFrames], [0, 25], clamp));
  const inO = interpolate(frame, [at, at + 10], [0, 1], clamp);
  const out = exitAt ? interpolate(frame, [exitAt, exitAt + 12], [1, 0], clamp) : 1;
  const dy = Math.sin((frame - at) / 70) * 6 * drift;
  const rot = Math.sin((frame - at) / 130) * 1.1 * drift;
  if (frame < at - 5) return null;
  return (
    <Img
      src={staticFile(`plates/${name}/f${String(idx).padStart(2, "0")}.png`)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        mixBlendMode: "multiply",
        opacity: opacity * inO * out,
        transform: `translateY(${dy}px) rotate(${rot}deg) ${flip ? "scaleX(-1)" : ""}`,
      }}
    />
  );
};
