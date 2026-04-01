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

export const S6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tomo springs in
  const tomoSpring = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const tomoY = interpolate(tomoSpring, [0, 1], [200, 0]);
  const tomoScale = interpolate(tomoSpring, [0, 1], [0.5, 1]);

  // Logo
  const logoSpring = spring({ frame: frame - 25, fps, config: { damping: 200 } });

  // Tagline
  const taglineSpring = spring({ frame: frame - 45, fps, config: { damping: 200 } });

  // Sub-tagline
  const subSpring = spring({ frame: frame - 65, fps, config: { damping: 200 } });

  // CTA button
  const ctaSpring = spring({ frame: frame - 90, fps, config: { damping: 12, stiffness: 150 } });

  // Gold pulse glow on the background
  const glowPulse = 0.5 + 0.3 * Math.sin((frame / fps) * Math.PI * 0.8);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.dark,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(ellipse at 50% 70%, rgba(250,195,4,${glowPulse * 0.15}) 0%, transparent 55%)`,
        }}
      />

      {/* Tomo celebrating */}
      <div
        style={{
          transform: `translateY(${tomoY}px) scale(${tomoScale})`,
          marginBottom: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -40,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(250,195,4,${glowPulse * 0.35}) 0%, transparent 70%)`,
          }}
        />
        <Img
          src={staticFile("tomo-celebrating.png")}
          style={{
            width: 320,
            height: 320,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
          }}
        />
      </div>

      {/* miotomo logo */}
      <div
        style={{
          opacity: interpolate(logoSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.8, 1])})`,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            color: COLORS.white,
            fontSize: 100,
            fontFamily: displayFont,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          mio
        </span>
        <span
          style={{
            color: COLORS.gold,
            fontSize: 100,
            fontFamily: displayFont,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          tomo
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: interpolate(taglineSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(taglineSpring, [0, 1], [20, 0])}px)`,
          color: COLORS.white,
          fontSize: 44,
          fontFamily: displayFont,
          fontWeight: 700,
          textAlign: "center",
          zIndex: 1,
          marginBottom: 16,
        }}
      >
        Where children become the experts.
      </div>

      {/* Sub tagline */}
      <div
        style={{
          opacity: interpolate(subSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(subSpring, [0, 1], [16, 0])}px)`,
          color: COLORS.textMuted,
          fontSize: 30,
          fontFamily: bodyFont,
          fontWeight: 600,
          textAlign: "center",
          zIndex: 1,
          marginBottom: 56,
          maxWidth: 800,
        }}
      >
        Voice-first AI learning for ages 6–12. Built on curiosity, not content delivery.
      </div>

      {/* CTA pill */}
      <div
        style={{
          opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(ctaSpring, [0, 1], [0.7, 1])})`,
          zIndex: 1,
          display: "flex",
          gap: 24,
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.gold,
            color: COLORS.dark,
            fontSize: 32,
            fontFamily: displayFont,
            fontWeight: 800,
            paddingInline: 48,
            paddingBlock: 20,
            borderRadius: 999,
            letterSpacing: "0.02em",
            boxShadow: `0 8px 40px rgba(250,195,4,0.45)`,
          }}
        >
          miotomo.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
