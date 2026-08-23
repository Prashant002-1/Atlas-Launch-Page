import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import { DUR, FPS, H, W } from "./timeline";
import "./fonts";

export const RemotionRoot: React.FC = () => (
  <Composition id="Film" component={Film} durationInFrames={DUR} fps={FPS} width={W} height={H} />
);
