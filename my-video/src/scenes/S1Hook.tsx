import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../lib/theme";
import { displayFont, bodyFont } from "../lib/fonts";

const Line: React.FC<{
  children: React.ReactNode;
  delay: number;
  color?: string;
  size?: number;
  weight?: number;
  font?: string;
}> = ({ children, delay, color = COLORS.white, size = 72, weight = 700, font }) => {
  const frame = useCurrentFrame();
  const { fps: lineFps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps: lineFps,
    config: { damping: 200 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const y = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        color,
        fontSize: size,
        fontWeight: weight,
        fontFamily: font ?? displayFont,
        lineHeight: 1.1,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
};

export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.dark,
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Subtle grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(250,195,4,0.06) 0%, transparent 60%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          padding: "0 120px",
          zIndex: 1,
        }}
      >
        <Line delay={0} color={COLORS.textMuted} size={52} weight={600} font={bodyFont}>
          Research shows children forget
        </Line>
        <Line delay={15} color={COLORS.white} size={96} weight={800}>
          70% of what they read
        </Line>
        <Line delay={30} color={COLORS.textMuted} size={52} weight={600} font={bodyFont}>
          within 24 hours.
        </Line>

        {/* Divider */}
        <div
          style={{
            width: interpolate(
              frame,
              [60, 80],
              [0, 200],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
            height: 2,
            backgroundColor: COLORS.gold,
            marginTop: 24,
            marginBottom: 24,
            borderRadius: 2,
          }}
        />

        <Line delay={75} color={COLORS.gold} size={72} weight={800}>
          What if there was a better way?
        </Line>
      </div>
    </AbsoluteFill>
  );
};
