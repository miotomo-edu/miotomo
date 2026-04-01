import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { S1Hook } from "./scenes/S1Hook";
import { S2TomoIntro } from "./scenes/S2TomoIntro";
import { S3Mechanic } from "./scenes/S3Mechanic";
import { S4Journey } from "./scenes/S4Journey";
import { S5Modalities } from "./scenes/S5Modalities";
import { S6CTA } from "./scenes/S6CTA";

// 30fps timeline (seconds × 30):
// S1 Hook         5s  = 150f
// S2 Tomo Intro   6s  = 180f
// S3 Mechanic     7s  = 210f
// S4 Journey      8s  = 240f
// S5 Modalities   7s  = 210f
// S6 CTA         12s  = 360f
// Total          45s = 1350f

export const MiotomoPitch: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={150} premountFor={30}>
          <S1Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={180} premountFor={30}>
          <S2TomoIntro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210} premountFor={30}>
          <S3Mechanic />
        </Series.Sequence>
        <Series.Sequence durationInFrames={240} premountFor={30}>
          <S4Journey />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210} premountFor={30}>
          <S5Modalities />
        </Series.Sequence>
        <Series.Sequence durationInFrames={360} premountFor={30}>
          <S6CTA />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
