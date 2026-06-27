import React, { useEffect, useMemo, useState } from "react";
import { extractField, extractLetters, StatusDots } from "./panelEventUtils";

interface Props {
  event: unknown;
  isWaiting: boolean;
}

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
        <StatusDots
          total={total}
          currentIndex={currentIndex}
          statuses={statuses}
        />
      )}

      <div className="flex w-full max-w-full items-center justify-center gap-2 overflow-hidden">
        {letters.map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border-2 border-white/50 bg-white/10 text-xl font-bold uppercase tracking-wide text-white"
            style={{
              flexBasis: `${Math.max(100 / letters.length, 12)}%`,
              maxWidth: `${Math.max(100 / letters.length, 12)}%`,
            }}
          >
            {shouldRevealLetters ? letter : (detectedLetters[index] ?? "")}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpellingPanel;
