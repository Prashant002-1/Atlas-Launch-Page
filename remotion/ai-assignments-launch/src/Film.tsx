import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { PaperField } from "./bg/PaperField";
import { S1Open } from "./scenes/S1Open";
import { S2Problem } from "./scenes/S2Problem";
import { S3Pivot } from "./scenes/S3Pivot";
import { S4Reveal } from "./scenes/S4Reveal";
import { S5Build } from "./scenes/S5Build";
import { S6Ship } from "./scenes/S6Ship";
import { S7Student } from "./scenes/S7Student";
import { S8Friction } from "./scenes/S8Friction";
import { S9Grading } from "./scenes/S9Grading";
import { S10Thesis } from "./scenes/S10Thesis";
import { S11Close } from "./scenes/S11Close";
import { SC } from "./timeline";

// Scenes are written against GLOBAL frames; the inner negative-offset
// Sequence re-anchors them while the outer one controls mounting.
const Global: React.FC<{
  b: { from: number; to: number };
  name: string;
  children: React.ReactNode;
}> = ({ b, name, children }) => (
  <Sequence from={b.from} durationInFrames={b.to - b.from} name={name} layout="none">
    <Sequence from={-b.from} layout="none">
      <AbsoluteFill>{children}</AbsoluteFill>
    </Sequence>
  </Sequence>
);

export const Film: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#f1f4ee" }}>
      <PaperField />
      <Global b={SC.s1} name="S1 open"><S1Open /></Global>
      <Global b={SC.s2} name="S2 problem"><S2Problem /></Global>
      <Global b={SC.s3} name="S3 pivot"><S3Pivot /></Global>
      <Global b={SC.s4} name="S4 reveal"><S4Reveal /></Global>
      <Global b={SC.s5} name="S5 build"><S5Build /></Global>
      <Global b={SC.s6} name="S6 ship"><S6Ship /></Global>
      <Global b={SC.s7} name="S7 student"><S7Student /></Global>
      <Global b={SC.s8} name="S8 friction"><S8Friction /></Global>
      <Global b={SC.s9} name="S9 draft grade"><S9Grading /></Global>
      <Global b={SC.s10} name="S10 thesis"><S10Thesis /></Global>
      <Global b={SC.s11} name="S11 close"><S11Close /></Global>
      <Audio src={staticFile("audio/film_audio.wav")} />
    </AbsoluteFill>
  );
};
