import React from "react";

type CircleDotsSymbolProps = {
  totalDots: number;
  completedDots?: number;
  currentDot?: number | null;
  size?: number;
  label?: string | number;
  className?: string;
  ringColor?: string;
  inactiveDotFill?: string;
  inactiveDotStroke?: string;
  completedDotFill?: string;
  completedDotStroke?: string;
  labelColor?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const CircleDotsSymbol: React.FC<CircleDotsSymbolProps> = ({
  totalDots,
  completedDots = 0,
  currentDot = null,
  size = 72,
  label,
  className,
  ringColor = "#0a1024",
  inactiveDotFill = "#0a1024",
  inactiveDotStroke = "#0a1024",
  completedDotFill = "#FAC304",
  completedDotStroke = "#FAC304",
  labelColor = "#111111",
}) => {
  const count = Math.max(0, Math.floor(totalDots));
  if (count <= 0) return null;

  const completed = clamp(Math.floor(completedDots), 0, count);
  const completedDotRadius = clamp(15 - count * 0.65, 5.5, 10);
  const inactiveDotRadius = clamp(completedDotRadius - 3.2, 3.2, 7.2);
  const ringRadius = 50 - completedDotRadius - 3;
  const center = 50;
  const strokeWidth = 2.6;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`${completed} of ${count} dots completed`}
    >
      <circle
        cx={center}
        cy={center}
        r={ringRadius}
        fill="none"
        stroke={ringColor}
        strokeWidth={strokeWidth}
      />

      {Array.from({ length: count }).map((_, index) => {
        const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / count);
        const x = center + Math.cos(angle) * ringRadius;
        const y = center + Math.sin(angle) * ringRadius;
        const isCompleted = index < completed;
        const isCurrent =
          !isCompleted &&
          typeof currentDot === "number" &&
          currentDot > 0 &&
          index + 1 === currentDot;

        return (
          <circle
            key={`dot-${index}`}
            cx={x}
            cy={y}
            r={isCompleted || isCurrent ? completedDotRadius : inactiveDotRadius}
            fill={isCompleted ? completedDotFill : inactiveDotFill}
            stroke={isCompleted ? completedDotStroke : inactiveDotStroke}
            strokeWidth={0}
          />
        );
      })}

      {label !== undefined && label !== null && label !== "" ? (
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill={labelColor}
          fontSize="28"
          fontWeight="700"
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
};

export default CircleDotsSymbol;
