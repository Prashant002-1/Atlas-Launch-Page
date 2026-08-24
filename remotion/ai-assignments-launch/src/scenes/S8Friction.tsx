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
        <Line at={sec(74.8)} size={98} dur={20} exitAt={sec(80.2)} style={{ textAlign: "center" }}>
          Cheating a conversation
        </Line>
        <div style={{ height: 22 }} />
        <Line
          at={sec(75.4)}
          size={98}
          dur={20}
          exitAt={sec(80.25)}
          style={{ textAlign: "center", color: C.inkSoft }}
        >
          is harder than having one.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
