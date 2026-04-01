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

const Avatar: React.FC<{
  emoji: string;
  label: string;
  sublabel: string;
  delay: number;
  color: string;
}> = ({ emoji, label, sublabel, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 130 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const scale = interpolate(s, [0, 1], [0.5, 1]);
  const y = interpolate(s, [0, 1], [60, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 90,
          boxShadow: `0 0 60px ${color}55`,
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          color: COLORS.white,
          fontSize: 44,
          fontFamily: displayFont,
          fontWeight: 800,
          textAlign: "center",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 28,
          fontFamily: bodyFont,
          fontWeight: 600,
          textAlign: "center",
          maxWidth: 240,
        }}
      >
        {sublabel}
      </div>
    </div>
  );
};

export const S3Mechanic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Arrow animation
  const arrowProgress = spring({ frame: frame - 50, fps, config: { damping: 200 } });
  const arrowWidth = interpolate(arrowProgress, [0, 1], [0, 220]);
  const arrowOpacity = interpolate(arrowProgress, [0, 1], [0, 1]);

  // Main quote
  const quoteSpring = spring({ frame: frame - 75, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.dark,
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 30% 50%, rgba(250,195,4,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(19,239,147,0.04) 0%, transparent 50%)",
        }}
      />

      {/* Top label */}
      <div
        style={{
          opacity: interpolate(
            spring({ frame, fps, config: { damping: 200 } }),
            [0, 1],
            [0, 1]
          ),
          color: COLORS.textMuted,
          fontSize: 32,
          fontFamily: bodyFont,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 64,
          zIndex: 1,
        }}
      >
        The core mechanic
      </div>

      {/* Two avatars + arrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          zIndex: 1,
        }}
      >
        <Avatar
          emoji="👧"
          label="The Child"
          sublabel="Expert & teacher"
          delay={10}
          color={COLORS.gold}
        />

        {/* Bidirectional arrow */}
        <div
          style={{
            opacity: arrowOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginInline: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: arrowWidth,
                height: 3,
                backgroundColor: COLORS.gold,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: `16px solid ${COLORS.gold}`,
              }}
            />
          </div>
          <div
            style={{
              color: COLORS.gold,
              fontSize: 24,
              fontFamily: bodyFont,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textAlign: "center",
            }}
          >
            TEACHES
          </div>
        </div>

        <Avatar
          emoji="🐱"
          label="Tomo"
          sublabel="Curious learner"
          delay={25}
          color="rgba(250,195,4,0.25)"
        />
      </div>

      {/* Quote */}
      <div
        style={{
          opacity: interpolate(quoteSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(quoteSpring, [0, 1], [30, 0])}px)`,
          marginTop: 80,
          paddingInline: 80,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            color: COLORS.white,
            fontSize: 52,
            fontFamily: displayFont,
            fontWeight: 700,
            lineHeight: 1.3,
            maxWidth: 900,
          }}
        >
          "For Tomo to learn —{" "}
          <span style={{ color: COLORS.gold }}>the child must learn first.</span>"
        </div>
      </div>
    </AbsoluteFill>
  );
};
