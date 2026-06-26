import React from "react";

export type PanelField =
  | "word"
  | "definition"
  | "total_words"
  | "word_position"
  | "correct"
  | "event_type"
  | "phase"
  | "game_type"
  | "data";

type PanelPayload = Partial<Record<PanelField, unknown>> & {
  data?: PanelPayload;
  letters?: unknown;
};

export const extractField = (
  event: unknown,
  field: PanelField,
): string | number | boolean | null => {
  if (!event || typeof event !== "object") return null;
  const typed = event as PanelPayload;
  const value = typed[field];

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return typed.data ? extractField(typed.data, field) : null;
};

export const extractLetters = (event: unknown): string[] | null => {
  if (!event || typeof event !== "object") return null;
  const typed = event as PanelPayload;

  if (Array.isArray(typed.letters)) {
    return typed.letters.map((letter) =>
      typeof letter === "string" ? letter : "",
    );
  }

  return typed.data ? extractLetters(typed.data) : null;
};

type StatusDotsProps = {
  total: number;
  currentIndex: number;
  statuses: Array<"correct" | "incorrect" | null>;
};

export const StatusDots: React.FC<StatusDotsProps> = ({
  total,
  currentIndex,
  statuses,
}) => {
  if (total <= 0) return null;

  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: total }).map((_, index) => {
        const circleIndex = index + 1;
        const isCurrent = circleIndex === currentIndex;
        const status = statuses[index];
        const statusClass =
          status === "correct"
            ? "bg-green-500 border-green-500"
            : status === "incorrect"
              ? "bg-red-500 border-red-500"
              : "bg-white/10 border-white/40";
        const currentGlow = isCurrent
          ? "shadow-[0_0_12px_rgba(99,102,241,0.7)]"
          : "";

        return (
          <span
            key={circleIndex}
            className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${statusClass} ${currentGlow}`}
          />
        );
      })}
    </div>
  );
};
