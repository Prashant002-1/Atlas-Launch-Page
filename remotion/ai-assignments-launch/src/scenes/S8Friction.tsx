import React from "react";
import { AbsoluteFill } from "remotion";
import { Plate } from "../ui/Marginalia";
import { Line } from "../text/Reveal";
import { C } from "../theme";
import { sec } from "../timeline";

// The quiet insight — a conversation is hard to fake.
export const S8Friction: React.FC = () => {
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Plate name="flow" at={sec(67.7)} x={1150} y={140} w={820} exitAt={sec(72.9)} drawFrames={50} opacity={0.2} flip />
      <div style={{ textAlign: "center", marginTop: -30 }}>
        <Line at={sec(68.5)} size={98} exitAt={sec(73.0)} style={{ textAlign: "center" }}>
          Cheating a conversation
        </Line>
        <div style={{ height: 22 }} />
        <Line
          at={sec(69.1)}
          size={98}
          exitAt={sec(73.05)}
          style={{ textAlign: "center", color: C.inkSoft }}
        >
          is harder than having one.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
