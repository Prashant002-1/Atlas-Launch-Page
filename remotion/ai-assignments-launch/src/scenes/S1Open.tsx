import React from "react";
import { AbsoluteFill } from "remotion";
import { Line, Words } from "../text/Reveal";
import { PAD_X, C } from "../theme";

// Cold open — the plain fact, stated straight. No branding, no tease.
export const S1Open: React.FC = () => {
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: PAD_X, right: PAD_X, top: 356 }}>
        <Line at={27} size={126} exitAt={222}>
          Every student is
        </Line>
        <Line at={40} size={126} exitAt={224}>
          already using AI.
        </Line>
        <div style={{ height: 54 }} />
        <Words
          at={134}
          gapFrames={7}
          size={33}
          color={C.muted}
          exitAt={220}
          text="The essay.  The problem set.  The take-home."
        />
      </div>
    </AbsoluteFill>
  );
};
