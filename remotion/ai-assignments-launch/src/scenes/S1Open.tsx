import React from "react";
import { AbsoluteFill } from "remotion";
import { Line, Words } from "../text/Reveal";
import { PAD_X, C } from "../theme";
import { sec } from "../timeline";

// Cold open — the plain fact, stated straight.
export const S1Open: React.FC = () => {
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: PAD_X, right: PAD_X, top: 356 }}>
        <Line at={sec(0.6)} size={126} exitAt={sec(5.85)}>
          Every student is
        </Line>
        <Line at={sec(1.0)} size={126} exitAt={sec(5.9)}>
          already using AI.
        </Line>
        <div style={{ height: 54 }} />
        <Words
          at={sec(3.4)}
          gapFrames={6}
          size={33}
          color={C.muted}
          exitAt={sec(5.8)}
          text="The essay.  The problem set.  The take-home."
        />
      </div>
    </AbsoluteFill>
  );
};
