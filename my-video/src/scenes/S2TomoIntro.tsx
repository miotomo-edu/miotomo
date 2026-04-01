import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../lib/theme";
import { displayFont, bodyFont } from "../lib/fonts";

// Orbiting dot
const OrbitDot: React.FC<{ angle: number; radius: number; delay: number; color: string }> = ({
  angle,
  radius,
  delay,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const opacity = interpolate(progress, [0, 1], [0, 0.7]);
  const currentAngle = angle + frame * 0.3;
  const x = Math.cos((currentAngle * Math.PI) / 180) * radius;
  const y = Math.sin((currentAngle * Math.PI) / 180) * radius;

  return (
    <div
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: color,
        opacity,
        transform: `translate(${x}px, ${y}px)`,
        left: "50%",
        top: "50%",
        marginLeft: -5,
        marginTop: -5,
      }}
    />
  );
};

export const S2TomoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Tomo springs in from below
  const tomoSpring = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const tomoY = interpolate(tomoSpring, [0, 1], [300, 0]);
  const tomoScale = interpolate(tomoSpring, [0, 1], [0.6, 1]);

  // Text stagger
  const fromLabel = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const nameSpring = spring({ frame: frame - 35, fps, config: { damping: 12, stiffness: 150 } });
  const taglineSpring = spring({ frame: frame - 55, fps, config: { damping: 200 } });

  const planetSpring = spring({ frame: frame - 70, fps, config: { damping: 200 } });

  // Glow pulse
  const glowPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.2),
    [-1, 1],
    [0.4, 0.8]
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
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(ellipse at 50% 60%, rgba(250,195,4,${glowPulse * 0.12}) 0%, transparent 55%)`,
        }}
      />

      {/* Orbiting dots */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <OrbitDot
          key={angle}
          angle={angle}
          radius={240 + (i % 2) * 30}
          delay={10 + i * 5}
          color={i % 2 === 0 ? COLORS.gold : COLORS.white}
        />
      ))}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          zIndex: 1,
        }}
      >
        {/* Tomo image */}
        <div
          style={{
            transform: `translateY(${tomoY}px) scale(${tomoScale})`,
            marginBottom: 32,
            position: "relative",
          }}
        >
          {/* Gold ring glow behind Tomo */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(250,195,4,${glowPulse * 0.3}) 0%, transparent 70%)`,
            }}
          />
          <Img
            src={staticFile("tomo.png")}
            style={{ width: 280, height: 280, objectFit: "contain", position: "relative", zIndex: 1 }}
          />
        </div>

        {/* "From the planet of knowledge" */}
        <div
          style={{
            opacity: interpolate(fromLabel, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(fromLabel, [0, 1], [20, 0])}px)`,
            color: COLORS.textMuted,
            fontSize: 32,
            fontFamily: bodyFont,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          From the planet of knowledge
        </div>

        {/* TOMO */}
        <div
          style={{
            opacity: interpolate(nameSpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(nameSpring, [0, 1], [0.7, 1])})`,
            color: COLORS.gold,
            fontSize: 140,
            fontFamily: displayFont,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Tomo
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: interpolate(taglineSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(taglineSpring, [0, 1], [20, 0])}px)`,
            color: COLORS.white,
            fontSize: 40,
            fontFamily: bodyFont,
            fontWeight: 400,
            marginTop: 12,
          }}
        >
          A Keeper of Knowledge. Curious. Ignorant of Earth.
        </div>

        {/* Planet badge */}
        <div
          style={{
            opacity: interpolate(planetSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(planetSpring, [0, 1], [10, 0])}px)`,
            marginTop: 32,
            paddingInline: 28,
            paddingBlock: 12,
            borderRadius: 999,
            border: `2px solid rgba(250,195,4,0.4)`,
            backgroundColor: "rgba(250,195,4,0.08)",
            color: COLORS.gold,
            fontSize: 28,
            fontFamily: bodyFont,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          ✦ MOTARA — THE PLANET OF KNOWLEDGE ✦
        </div>
      </div>
    </AbsoluteFill>
  );
};
