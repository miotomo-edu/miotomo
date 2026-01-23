import React, { useMemo, useState } from "react";

type LetterStatus = "correct" | "present" | "absent" | "empty";

type Attempt = {
  guess: string;
  statuses: LetterStatus[];
};

const WORDS = [
  "MOON",
  "STAR",
  "COMET",
  "ORBIT",
  "SPACE",
  "PLANET",
  "ROCKET",
  "GALAXY",
  "ASTEROID",
  "TELESCOPE",
];

const MAX_ATTEMPTS = 5;

const pickWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

const evaluateGuess = (guess: string, target: string): LetterStatus[] => {
  const normalizedGuess = guess.toUpperCase();
  const normalizedTarget = target.toUpperCase();
  const length = normalizedTarget.length;
  const statuses: LetterStatus[] = Array.from({ length }, () => "absent");
  const counts: Record<string, number> = {};

  for (let i = 0; i < length; i += 1) {
    const letter = normalizedTarget[i];
    counts[letter] = (counts[letter] ?? 0) + 1;
  }

  for (let i = 0; i < length; i += 1) {
    if (normalizedGuess[i] === normalizedTarget[i]) {
      statuses[i] = "correct";
      counts[normalizedGuess[i]] -= 1;
    }
  }

  for (let i = 0; i < length; i += 1) {
    if (statuses[i] === "correct") continue;
    const letter = normalizedGuess[i];
    if (counts[letter] > 0) {
      statuses[i] = "present";
      counts[letter] -= 1;
    }
  }

  return statuses;
};

const getTileClass = (status: LetterStatus, filled: boolean) => {
  if (!filled) {
    return "border-white/25 bg-white/5";
  }
  if (status === "correct") return "border-green-400 bg-green-500 text-white";
  if (status === "present") return "border-yellow-400 bg-yellow-500 text-black";
  if (status === "absent") return "border-white/20 bg-white/10 text-white/60";
  return "border-white/25 bg-white/5";
};

const getUnderlineClass = (status: LetterStatus, filled: boolean) => {
  if (!filled) {
    return "border-white/30 text-white";
  }
  if (status === "correct") return "border-green-400 text-white";
  if (status === "present") return "border-yellow-400 text-white";
  if (status === "absent") return "border-white/20 text-white/70";
  return "border-white/30 text-white";
};

const VisualSpellingGame: React.FC = () => {
  const [targetWord, setTargetWord] = useState(pickWord);
  const [currentGuess, setCurrentGuess] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [message, setMessage] = useState("");

  const isComplete =
    attempts.some((attempt) => attempt.guess === targetWord) ||
    attempts.length >= MAX_ATTEMPTS;

  const gridRows = useMemo(() => {
    const rows: Attempt[] = [...attempts];
    const wordLength = targetWord.length;
    if (attempts.length < MAX_ATTEMPTS) {
      rows.push({
        guess: currentGuess.padEnd(wordLength, " "),
        statuses: Array.from({ length: wordLength }, () => "empty"),
      });
    }
    while (rows.length < MAX_ATTEMPTS) {
      rows.push({
        guess: " ".repeat(wordLength),
        statuses: Array.from({ length: wordLength }, () => "empty"),
      });
    }
    return rows;
  }, [attempts, currentGuess, targetWord]);

  const letterStatuses = useMemo(() => {
    const statusMap: Record<string, LetterStatus> = {};
    attempts.forEach((attempt) => {
      attempt.guess.split("").forEach((letter, index) => {
        const status = attempt.statuses[index];
        if (status === "correct") {
          statusMap[letter] = "correct";
        } else if (status === "present") {
          if (statusMap[letter] !== "correct") {
            statusMap[letter] = "present";
          }
        } else if (!statusMap[letter]) {
          statusMap[letter] = "absent";
        }
      });
    });
    return statusMap;
  }, [attempts]);

  const handleLetter = (letter: string) => {
    if (isComplete) return;
    if (currentGuess.length >= targetWord.length) return;
    setMessage("");
    setCurrentGuess((prev) => `${prev}${letter}`);
  };

  const handleDelete = () => {
    if (isComplete) return;
    setMessage("");
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (isComplete) return;
    if (currentGuess.length < targetWord.length) {
      setMessage("Fill all letters before submitting.");
      return;
    }
    const guess = currentGuess.toUpperCase();
    const statuses = evaluateGuess(guess, targetWord);
    const nextAttempts = [...attempts, { guess, statuses }];
    setAttempts(nextAttempts);
    setCurrentGuess("");

    if (guess === targetWord) {
      setMessage("Great job! You spelled it right!");
    } else if (nextAttempts.length >= MAX_ATTEMPTS) {
      setMessage(`Nice try! The spelling is ${targetWord}.`);
    } else {
      setMessage("");
    }
  };

  const handleReset = () => {
    setTargetWord(pickWord());
    setCurrentGuess("");
    setAttempts([]);
    setMessage("");
  };

  const canSubmit = currentGuess.length === targetWord.length;
  const submitLabel = isComplete ? "Next" : "Submit";
  const submitHandler = isComplete ? handleReset : handleSubmit;

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 bg-black px-6 py-6 text-white">
      <div className="text-center">
        <p className="mt-2 text-4xl font-extrabold tracking-[0.4em]">
          {targetWord}
        </p>
      </div>

      <div className="w-full max-w-md flex-1 space-y-2">
        {gridRows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-2">
            {row.guess.split("").map((letter, index) => {
              const status = row.statuses[index];
              const filled = letter.trim().length > 0;
              const isActiveRow = rowIndex === attempts.length && !isComplete;
              const isActiveSlot =
                isActiveRow && currentGuess.length === index;
              return (
                <div
                  key={`tile-${rowIndex}-${index}`}
                  className={`flex min-h-[2.25rem] flex-1 items-center justify-center border-b-2 text-lg font-semibold uppercase ${getUnderlineClass(
                    status,
                    filled,
                  )} ${isActiveRow ? "!border-white !text-white" : ""}`}
                >
                  {letter.trim()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        {message && (
          <p className="text-center text-sm text-white/70">{message}</p>
        )}
      </div>

      <div className="w-full max-w-md flex-1 space-y-2">
        <div className="grid grid-cols-7 gap-2">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
            const status = letterStatuses[letter];
            const statusClass = status
              ? getTileClass(status, true)
              : "border-white/15 bg-white/5";
            return (
              <button
                key={letter}
                type="button"
                onClick={() => handleLetter(letter)}
                className={`min-h-[2.5rem] rounded-md border text-sm font-semibold ${statusClass}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="min-h-[2.75rem] rounded-md border border-white/20 bg-white/5 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={submitHandler}
            className={`min-h-[2.75rem] rounded-md text-sm font-semibold uppercase tracking-wide ${
              isComplete
                ? "bg-white text-black"
                : canSubmit
                  ? "bg-white text-black"
                  : "bg-white/40 text-black/60"
            }`}
            disabled={!isComplete && !canSubmit}
          >
            {submitLabel}
          </button>
        </div>
      </div>

      {isComplete && (
        <p className="text-center text-xs uppercase tracking-[0.2em] text-white/50">
          Ready for the next word
        </p>
      )}
    </div>
  );
};

export default VisualSpellingGame;
