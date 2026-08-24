import React from "react";
import { AbsoluteFill } from "remotion";
import { Line } from "../text/Reveal";
import { C } from "../theme";
import { sec } from "../timeline";

// The quiet insight — a conversation is hard to fake.
export const S8Friction: React.FC = () => {
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginTop: -30 }}>
        <Line at={sec(84.8)} size={98} exitAt={sec(91.0)} style={{ textAlign: "center" }}>
          Cheating a conversation
        </Line>
        <div style={{ height: 22 }} />
        <Line
          at={sec(85.5)}
          size={98}
          exitAt={sec(91.05)}
          style={{ textAlign: "center", color: C.inkSoft }}
        >
          is harder than having one.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
