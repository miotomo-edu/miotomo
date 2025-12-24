import React, { useEffect, useMemo, useState } from "react";

interface Props {
  event: unknown;
  isWaiting: boolean;
}

type FieldKey =
  | "word"
  | "total_words"
  | "word_position"
  | "correct"
  | "event_type"
  | "phase"
  | "game_type"
  | "data";

type SpellingPayload = {
  word?: string;
  total_words?: number;
  word_position?: number;
  correct?: boolean;
  event_type?: string;
  phase?: string;
  game_type?: string;
  data?: SpellingPayload;
  letters?: string[];
};

const extractField = (
  event: unknown,
  field: FieldKey,
): string | number | boolean | null => {
  if (!event || typeof event !== "object") return null;
  const typed = event as SpellingPayload;
  const value = typed[field];
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typed.data) {
    return extractField(typed.data, field);
  }

  return null;
};

const extractLetters = (event: unknown): string[] | null => {
  if (!event || typeof event !== "object") return null;
  const typed = event as SpellingPayload;
  if (Array.isArray(typed.letters)) {
    return typed.letters.map((letter) =>
      typeof letter === "string" ? letter : "",
    );
  }

  if (typed.data) {
    return extractLetters(typed.data);
  }

  return null;
};

const SpellingPanel: React.FC<Props> = ({ event, isWaiting }) => {
  const word = extractField(event, "word") as string | null;
  const totalWords = extractField(event, "total_words") as number | null;
  const wordPosition = extractField(event, "word_position") as number | null;
  const isCorrect = extractField(event, "correct") as boolean | null;
  const eventType = extractField(event, "event_type") as string | null;
  const phase = extractField(event, "phase") as string | null;
  const gameType = extractField(event, "game_type") as string | null;
  const detectedLettersPayload = extractLetters(event);
  const [statuses, setStatuses] = useState<
    Array<"correct" | "incorrect" | null>
  >([]);
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [displayWord, setDisplayWord] = useState("");
  const [detectedLetters, setDetectedLetters] = useState<string[]>([]);

  useEffect(() => {
    if (eventType === "game_start" || eventType === "game_reset") {
      setStatuses([]);
      setCurrentRound(null);
      setIsRevealed(false);
      setDisplayWord("");
      setDetectedLetters([]);
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
    if (gameType !== "spelling") return;
    if (eventType === "question_starting") {
      if (typeof word === "string" && word.trim().length > 0) {
        setDisplayWord(word.trim());
        setDetectedLetters(
          Array.from({ length: word.trim().length }, () => ""),
        );
      }
      setIsRevealed(false);
    }
  }, [eventType, gameType, word]);

  useEffect(() => {
    if (typeof word === "string" && word.trim().length > 0) {
      setDisplayWord(word.trim());
      setDetectedLetters(Array.from({ length: word.trim().length }, () => ""));
    }
  }, [word]);

  useEffect(() => {
    if (gameType !== "spelling") return;
    if (eventType !== "answer_received") return;
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
    setIsRevealed(true);
  }, [eventType, gameType, wordPosition, isCorrect]);

  useEffect(() => {
    if (!wordPosition) return;
    if (currentRound === null || wordPosition !== currentRound) {
      setCurrentRound(wordPosition);
      setIsRevealed(false);
    }
  }, [wordPosition, currentRound]);

  useEffect(() => {
    if (eventType === "game_complete") {
      setIsRevealed(true);
    }
  }, [eventType]);

  useEffect(() => {
    if (gameType !== "spelling") return;
    if (eventType !== "spelling_letter_detected") return;
    if (!detectedLettersPayload || !detectedLettersPayload.length) return;
    setDetectedLetters((prev) => {
      if (!prev.length) return prev;
      let changed = false;
      const next = prev.map((existing, index) => {
        if (index >= detectedLettersPayload.length) return existing ?? "";
        const normalized =
          detectedLettersPayload[index]?.toUpperCase?.() ??
          detectedLettersPayload[index] ??
          "";
        if (normalized !== existing) {
          changed = true;
          return normalized;
        }
        return existing ?? "";
      });
      return changed ? next : prev;
    });
  }, [eventType, gameType, detectedLettersPayload]);

  const letters = useMemo(() => displayWord.split(""), [displayWord]);
  const showWordSquares = letters.length > 0;
  const shouldRevealLetters = isRevealed || eventType === "game_complete";

  if (isWaiting || !showWordSquares) {
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
      )}

      <div className="flex w-full max-w-full items-center justify-center gap-2 overflow-hidden">
        {letters.map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border-2 border-gray-800 bg-white text-xl font-bold uppercase tracking-wide shadow-sm"
            style={{
              flexBasis: `${Math.max(100 / letters.length, 12)}%`,
              maxWidth: `${Math.max(100 / letters.length, 12)}%`,
            }}
          >
            {shouldRevealLetters ? letter : detectedLetters[index] ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpellingPanel;
