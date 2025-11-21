import React, { useEffect, useState } from "react";

interface Props {
  event: unknown;
  isWaiting: boolean;
}

type VocabularyPayload = {
  word?: string;
  definition?: string;
  total_words?: number;
  word_position?: number;
  correct?: boolean;
  event_type?: string;
  phase?: string;
  data?: VocabularyPayload;
};

type FieldKey =
  | "word"
  | "definition"
  | "total_words"
  | "word_position"
  | "correct"
  | "event_type"
  | "phase";

const extractField = (
  event: unknown,
  field: FieldKey,
): string | number | boolean | null => {
  if (!event || typeof event !== "object") return null;
  const typed = event as VocabularyPayload;
  const value = typed[field];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typed.data) {
    return extractField(typed.data, field);
  }

  return null;
};

const VocabularyPanel: React.FC<Props> = ({ event, isWaiting }) => {
  const word = extractField(event, "word") as string | null;
  const definition = extractField(event, "definition") as string | null;
  const totalWords = extractField(event, "total_words") as number | null;
  const wordPosition = extractField(event, "word_position") as number | null;
  const isCorrect = extractField(event, "correct") as boolean | null;
  const eventType = extractField(event, "event_type") as string | null;
  const phase = extractField(event, "phase") as string | null;
  const [statuses, setStatuses] = useState<Array<"correct" | "incorrect" | null>>([]);

  useEffect(() => {
    if (eventType === "game_start" || eventType === "game_reset") {
      setStatuses([]);
      return;
    }
    if (!totalWords || totalWords <= 0) {
      return;
    }
    setStatuses((prev) => {
      if (prev.length === totalWords) return prev;
      const next = Array.from({ length: totalWords }, (_, idx) => prev[idx] ?? null);
      return next;
    });
  }, [totalWords, eventType]);

  useEffect(() => {
    if (eventType !== "answer_received") return;
    if (phase && phase !== "definition") return;
    if (!wordPosition || typeof isCorrect !== "boolean") return;
    setStatuses((prev) => {
      if (!prev.length) return prev;
      const index = wordPosition - 1;
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      const newStatus = isCorrect ? "correct" : "incorrect";
      if (next[index] === newStatus) return prev;
      next[index] = newStatus;
      return next;
    });
  }, [eventType, wordPosition, isCorrect]);

  const showWord = eventType !== "game_complete";

  if (isWaiting || (!word && showWord)) {
    return <div className="h-full w-full" />;
  }

  const total = totalWords ?? statuses.length;
  const currentIndex = wordPosition ?? 0;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-6 py-5 text-center">
      {total > 0 && (
        <div className="flex items-center gap-3">
          {Array.from({ length: total }).map((_, index) => {
            const circleIndex = index + 1;
            const isCurrent = circleIndex === currentIndex;
            const statusClass = (() => {
              const status = statuses[index];
              if (status === "correct") return "bg-green-500 border-green-500";
              if (status === "incorrect") return "bg-red-500 border-red-500";
              return "bg-white border-gray-300";
            })();

            const currentGlow = isCurrent ? "shadow-[0_0_12px_rgba(99,102,241,0.7)]" : "";

            return (
              <span
                key={circleIndex}
                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${statusClass} ${currentGlow}`}
              />
            );
          })}
        </div>
      )}

      {showWord && word && (
        <>
          <span className="text-4xl font-extrabold uppercase tracking-wide text-gray-900">
            {word}
          </span>
          {definition && (
            <span className="text-base font-medium text-gray-700">{definition}</span>
          )}
        </>
      )}
    </div>
  );
};

export default VocabularyPanel;
