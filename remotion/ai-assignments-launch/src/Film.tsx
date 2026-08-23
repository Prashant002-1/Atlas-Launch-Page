import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { PaperField } from "./bg/PaperField";
import { S1Open } from "./scenes/S1Open";
import { S2Problem } from "./scenes/S2Problem";
import { S3Pivot } from "./scenes/S3Pivot";
import { S45Architecture } from "./scenes/S45Architecture";
import { S6Student } from "./scenes/S6Student";
import { S7Thesis } from "./scenes/S7Thesis";
import { S8Close } from "./scenes/S8Close";
import { SC } from "./timeline";

// Scene files are written against GLOBAL frame numbers (sec(...) constants in
// timeline.ts). A Sequence resets useCurrentFrame to local frames, so each
// scene is wrapped in an inner Sequence with a negative offset that re-anchors
// its children back to the global clock, while the outer Sequence still
// controls mount/unmount.
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
      <Global b={SC.s45} name="S45 reveal + architecture"><S45Architecture /></Global>
      <Global b={SC.s6} name="S6 student"><S6Student /></Global>
      <Sequence from={SC.s7.from} durationInFrames={SC.s7.to - SC.s7.from} name="S7 thesis" layout="none">
        <AbsoluteFill><S7Thesis from={SC.s7.from} /></AbsoluteFill>
      </Sequence>
      <Sequence from={SC.s8.from} durationInFrames={SC.s8.to - SC.s8.from} name="S8 close" layout="none">
        <AbsoluteFill><S8Close from={SC.s8.from} /></AbsoluteFill>
      </Sequence>
      <Audio src={staticFile("audio/film_audio.wav")} />
    </AbsoluteFill>
  );
};
