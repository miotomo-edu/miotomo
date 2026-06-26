import React, { useEffect, useState } from "react";
import { extractField, StatusDots } from "./panelEventUtils";

interface Props {
  event: unknown;
  isWaiting: boolean;
}

const VocabularyPanel: React.FC<Props> = ({ event, isWaiting }) => {
  const word = extractField(event, "word") as string | null;
  const definition = extractField(event, "definition") as string | null;
  const totalWords = extractField(event, "total_words") as number | null;
  const wordPosition = extractField(event, "word_position") as number | null;
  const isCorrect = extractField(event, "correct") as boolean | null;
  const eventType = extractField(event, "event_type") as string | null;
  const phase = extractField(event, "phase") as string | null;
  const [statuses, setStatuses] = useState<
    Array<"correct" | "incorrect" | null>
  >([]);

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
      const next = Array.from(
        { length: totalWords },
        (_, idx) => prev[idx] ?? null,
      );
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
        <StatusDots
          total={total}
          currentIndex={currentIndex}
          statuses={statuses}
        />
      )}

      {showWord && word && (
        <>
          <span className="text-4xl font-extrabold uppercase tracking-wide text-white">
            {word}
          </span>
          {definition && (
            <span className="text-base font-medium text-white/70">
              {definition}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default VocabularyPanel;
