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

const Dot: React.FC<{
  index: number;
  delay: number;
  filled: boolean;
  isCurrent: boolean;
  label: string;
}> = ({ index, delay, filled, isCurrent, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 150 } });
  const scale = interpolate(s, [0, 1], [0, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  const size = 72;
  const bg = filled
    ? COLORS.gold
    : isCurrent
    ? "transparent"
    : "rgba(255,255,255,0.08)";
  const border = filled
    ? `3px solid ${COLORS.gold}`
    : isCurrent
    ? `3px solid ${COLORS.gold}`
    : "3px solid rgba(255,255,255,0.2)";
  const textColor = filled ? COLORS.dark : isCurrent ? COLORS.gold : COLORS.textMuted;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: bg,
          border,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textColor,
          fontSize: 28,
          fontFamily: displayFont,
          fontWeight: 800,
          boxShadow: filled || isCurrent ? `0 0 24px rgba(250,195,4,0.4)` : "none",
        }}
      >
        {filled ? "✓" : index}
      </div>
      <div
        style={{
          color: isCurrent ? COLORS.gold : COLORS.textMuted,
          fontSize: 22,
          fontFamily: bodyFont,
          fontWeight: 600,
          textAlign: "center",
          maxWidth: 120,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const S4Journey: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  const circleSpring = spring({ frame: frame - 20, fps, config: { damping: 200 } });

  const dots = [
    { label: "Dot 1", filled: true },
    { label: "Dot 2", filled: true },
    { label: "Dot 3", filled: false, current: true },
    { label: "Dot 4", filled: false },
    { label: "Dot 5", filled: false },
  ];

  const teachTimeSpring = spring({ frame: frame - 140, fps, config: { damping: 10, stiffness: 120 } });
  const arrowSpring = spring({ frame: frame - 120, fps, config: { damping: 200 } });

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
            "radial-gradient(circle at 50% 40%, rgba(250,195,4,0.05) 0%, transparent 55%)",
        }}
      />

      {/* Title */}
      <div
        style={{
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [-30, 0])}px)`,
          color: COLORS.textMuted,
          fontSize: 30,
          fontFamily: bodyFont,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 16,
          zIndex: 1,
        }}
      >
        The journey
      </div>

      {/* Circle card */}
      <div
        style={{
          opacity: interpolate(circleSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(circleSpring, [0, 1], [40, 0])}px)`,
          backgroundColor: COLORS.darkSurface,
          borderRadius: 32,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "36px 56px",
          marginBottom: 48,
          zIndex: 1,
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 24,
            fontFamily: bodyFont,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Circle
        </div>
        <div
          style={{
            color: COLORS.white,
            fontSize: 48,
            fontFamily: displayFont,
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          The Power Struggle of Rome
        </div>
      </div>

      {/* Dots row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 48,
          zIndex: 1,
          marginBottom: 40,
        }}
      >
        {dots.map((dot, i) => (
          <Dot
            key={i}
            index={i + 1}
            delay={40 + i * 18}
            filled={dot.filled}
            isCurrent={!!dot.current}
            label={dot.label}
          />
        ))}

        {/* Arrow to Teachtime */}
        <div
          style={{
            opacity: interpolate(arrowSpring, [0, 1], [0, 1]),
            display: "flex",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <div
            style={{
              width: interpolate(arrowSpring, [0, 1], [0, 40]),
              height: 3,
              backgroundColor: COLORS.gold,
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: `12px solid ${COLORS.gold}`,
            }}
          />
        </div>

        {/* Teachtime */}
        <div
          style={{
            opacity: interpolate(teachTimeSpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(teachTimeSpring, [0, 1], [0.4, 1])})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.gold}, #f5a623)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              boxShadow: `0 0 40px rgba(250,195,4,0.6)`,
            }}
          >
            ✦
          </div>
          <div
            style={{
              color: COLORS.gold,
              fontSize: 22,
              fontFamily: bodyFont,
              fontWeight: 800,
              textAlign: "center",
              maxWidth: 120,
            }}
          >
            Teach­time
          </div>
        </div>
      </div>

      {/* Flow label */}
      <div
        style={{
          opacity: interpolate(
            spring({ frame: frame - 100, fps, config: { damping: 200 } }),
            [0, 1],
            [0, 1]
          ),
          color: COLORS.textMuted,
          fontSize: 30,
          fontFamily: bodyFont,
          fontWeight: 600,
          zIndex: 1,
          letterSpacing: "0.08em",
        }}
      >
        Listen{" "}
        <span style={{ color: COLORS.gold }}>→</span> Discuss{" "}
        <span style={{ color: COLORS.gold }}>→</span> Teach Tomo
      </div>
    </AbsoluteFill>
  );
};
