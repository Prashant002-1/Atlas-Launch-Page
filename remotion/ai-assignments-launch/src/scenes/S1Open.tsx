import React from "react";
import { AbsoluteFill } from "remotion";
import { Line } from "../text/Reveal";
import { Plate } from "../ui/Marginalia";
import { PAD_X } from "../theme";
import { sec } from "../timeline";

// Cold open — the fact, and a current already moving through the room.
export const S1Open: React.FC = () => {
  return (
    <AbsoluteFill>
      <Plate name="flow" at={sec(0.25)} x={1290} y={230} w={560} exitAt={sec(4.1)} drawFrames={36} opacity={0.42} />
      <div style={{ position: "absolute", left: PAD_X, right: PAD_X, top: 400 }}>
        <Line at={sec(0.45)} size={126} exitAt={sec(4.12)}>
          Every student is
        </Line>
        <Line at={sec(0.7)} size={126} exitAt={sec(4.16)}>
          already using AI.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
