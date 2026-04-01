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

const MODALITIES = [
  { emoji: "🗣️", label: "Storytelling", desc: "Retell & discuss the episode", color: "#F2D47C" },
  { emoji: "⚔️", label: "Debating", desc: "Defend your position out loud", color: "#E49C88" },
  { emoji: "✏️", label: "Spelling", desc: "Help Tomo spell the words", color: "#92B1D1" },
  { emoji: "📖", label: "Vocabulary", desc: "Teach Tomo what words mean", color: "#97BBA0" },
  { emoji: "🎓", label: "Teachtime", desc: "Teach Tomo everything you learned", color: COLORS.gold },
];

const ModalityCard: React.FC<{
  emoji: string;
  label: string;
  desc: string;
  color: string;
  delay: number;
}> = ({ emoji, label, desc, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [80, 0]);
  const scale = interpolate(s, [0, 1], [0.85, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        backgroundColor: COLORS.darkSurface,
        borderRadius: 28,
        border: `1px solid rgba(255,255,255,0.08)`,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: 200,
        boxShadow: `0 16px 48px rgba(0,0,0,0.3)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Color accent top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: color,
        }}
      />
      <div style={{ fontSize: 52 }}>{emoji}</div>
      <div
        style={{
          color: COLORS.white,
          fontSize: 30,
          fontFamily: displayFont,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 20,
          fontFamily: bodyFont,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {desc}
      </div>
    </div>
  );
};

export const S5Modalities: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.dark,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity: fadeOut,
        gap: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(250,195,4,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Title */}
      <div
        style={{
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [-20, 0])}px)`,
          marginBottom: 56,
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 28,
            fontFamily: bodyFont,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          5 ways to learn
        </div>
        <div
          style={{
            color: COLORS.white,
            fontSize: 72,
            fontFamily: displayFont,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          Every session. Every skill.
        </div>
      </div>

      {/* Cards row */}
      <div
        style={{
          display: "flex",
          gap: 24,
          zIndex: 1,
        }}
      >
        {MODALITIES.map((m, i) => (
          <ModalityCard
            key={m.label}
            emoji={m.emoji}
            label={m.label}
            desc={m.desc}
            color={m.color}
            delay={20 + i * 15}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
