import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../hooks/integrations/supabase/client";

type LetterStatus = "correct" | "present" | "absent" | "empty";

type Attempt = {
  guess: string;
  statuses: LetterStatus[];
};

const TEST_CIRCLE_ID = "ff7f12ca-78e4-4987-9d2c-63a68694a1b1";
const TEST_DOT = 1;
const WORD_INTERVAL_SECONDS = 10;
const MAX_ATTEMPTS = 3;

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
  const [words, setWords] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [targetWord, setTargetWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [message, setMessage] = useState("");
  const [isCorrectSolved, setIsCorrectSolved] = useState(false);
  const [wordResults, setWordResults] = useState<
    Array<"correct" | "wrong" | null>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);

  const isRoundComplete = isCorrectSolved || attempts.length >= MAX_ATTEMPTS;
  const isFailedRound = attempts.length >= MAX_ATTEMPTS && !isCorrectSolved;

  useEffect(() => {
    let isActive = true;

    const fetchSpellingData = async () => {
      setIsLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from("dots_spelling")
        .select("words,audio")
        .eq("circle_id", TEST_CIRCLE_ID)
        .eq("dot", TEST_DOT)
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        console.error("Failed to load spelling data:", error);
        setLoadError("Unable to load spelling data.");
        setIsLoading(false);
        return;
      }

      const wordList = Array.isArray(data?.words)
        ? data.words.filter((word) => typeof word === "string" && word.length)
        : [];
      const audio = typeof data?.audio === "string" ? data.audio : "";

      setWords(wordList);
      setAudioUrl(audio);
      setCurrentWordIndex(0);
      setTargetWord(wordList[0]?.toUpperCase() ?? "");
      setHasPlayedCurrent(false);
      setWordResults(Array.from({ length: wordList.length }, () => null));
      setIsLoading(false);
    };

    fetchSpellingData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!audioUrl) {
      audioRef.current?.pause();
      audioRef.current = null;
      setAudioReady(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.preload = "auto";

    const handleLoaded = () => {
      setAudioReady(true);
    };

    const handleError = () => {
      console.warn("Failed to load spelling audio.");
      setAudioReady(false);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("canplaythrough", handleLoaded);
    audio.addEventListener("error", handleError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("canplaythrough", handleLoaded);
      audio.removeEventListener("error", handleError);
      setAudioReady(false);
    };
  }, [audioUrl]);

  const playWordAtIndex = (index: number) => {
    if (!audioRef.current || !audioUrl) {
      return;
    }
    if (!audioReady) {
      pendingSeekRef.current = index;
      return;
    }

    const seekTime = index * WORD_INTERVAL_SECONDS;
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = seekTime;
      audioRef.current.play();
      setHasPlayedCurrent(true);
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      playbackTimeoutRef.current = setTimeout(() => {
        audioRef.current?.pause();
      }, WORD_INTERVAL_SECONDS * 1000);
    } catch (error) {
      console.warn("Failed to play spelling audio:", error);
    }
  };

  useEffect(() => {
    if (!audioReady || pendingSeekRef.current === null) return;
    const index = pendingSeekRef.current;
    pendingSeekRef.current = null;
    playWordAtIndex(index);
  }, [audioReady]);

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
    if (isRoundComplete) return;
    if (currentGuess.length >= targetWord.length) return;
    setMessage("");
    setCurrentGuess((prev) => `${prev}${letter}`);
  };

  const handleDelete = () => {
    if (isRoundComplete) return;
    setMessage("");
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (isRoundComplete) return;
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
      setMessage("");
      setIsCorrectSolved(true);
      setWordResults((prev) => {
        const next = [...prev];
        next[currentWordIndex] = "correct";
        return next;
      });
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
      audioRef.current?.pause();
    } else if (nextAttempts.length >= MAX_ATTEMPTS) {
      setMessage("");
      setWordResults((prev) => {
        const next = [...prev];
        next[currentWordIndex] = "wrong";
        return next;
      });
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
      audioRef.current?.pause();
    } else {
      setMessage("");
    }
  };

  const handleReset = (nextIndex: number) => {
    if (nextIndex === 0 && currentWordIndex === words.length - 1) {
      setWordResults(Array.from({ length: words.length }, () => null));
    }
    setCurrentWordIndex(nextIndex);
    setTargetWord(words[nextIndex]?.toUpperCase() ?? "");
    setCurrentGuess("");
    setAttempts([]);
    setMessage("");
    setIsCorrectSolved(false);
    setHasPlayedCurrent(false);
  };

  const canSubmit = currentGuess.length === targetWord.length;
  const submitLabel = "Submit";
  const submitHandler = isRoundComplete
    ? () => {
        if (!words.length) return;
        const nextIndex = (currentWordIndex + 1) % words.length;
        handleReset(nextIndex);
      }
    : handleSubmit;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <span className="text-sm uppercase tracking-[0.2em] text-white/60">
          Loading spelling...
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black text-white">
        <span className="text-sm uppercase tracking-[0.2em] text-white/60">
          {loadError}
        </span>
      </div>
    );
  }

  if (!targetWord) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black text-white">
        <span className="text-sm uppercase tracking-[0.2em] text-white/60">
          No spelling words available.
        </span>
      </div>
    );
  }

  return (
    <div className="safe-area-top relative flex min-h-full w-full flex-1 flex-col items-center gap-3 bg-black px-4 py-4 text-white sm:gap-4 sm:px-6 sm:py-6">
      <div className="relative flex w-full max-w-md items-center gap-3">
        <span className="text-[0.6rem] font-semibold tracking-[0.3em] text-gray-300">
          WORDS
        </span>
        <div className="relative flex-1">
          <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-gray-300" />
          <div className="relative flex w-full items-center justify-between gap-2 py-2">
            {words.map((_, index) => {
              const isActive = index === currentWordIndex;
              const result = wordResults[index];
              const dotColor =
                result === "correct"
                  ? "bg-green-500"
                  : result === "wrong"
                    ? "bg-yellow-400"
                    : "bg-gray-300";
              return (
                <div
                  key={`word-step-${index}`}
                  className="relative flex flex-shrink-0 items-center justify-center"
                >
                  <span
                    className={`rounded-full ${dotColor} ${
                      isActive ? "h-3 w-3" : "h-2 w-2"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-md items-center justify-center gap-3 sm:gap-4">
        <p className="text-3xl font-extrabold tracking-[0.35em] sm:text-4xl sm:tracking-[0.4em]">
          {targetWord}
        </p>
        <button
          type="button"
          onClick={() => playWordAtIndex(currentWordIndex)}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-white sm:h-11 sm:w-11 ${
            hasPlayedCurrent
              ? "border-white/40"
              : "border-white/80 animate-pulse"
          }`}
          aria-label={hasPlayedCurrent ? "Replay word" : "Play word"}
        >
          {hasPlayedCurrent ? (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12A9 9 0 1 0 6 5.5" />
              <path d="M3 4V9H8" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5.5L18.5 12L8 18.5V5.5Z" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-md flex-1 space-y-3 min-h-0 overflow-y-auto">
        {gridRows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-2">
            {row.guess.split("").map((letter, index) => {
              const status = row.statuses[index];
              const filled = letter.trim().length > 0;
              const isActiveRow =
                rowIndex === attempts.length && !isRoundComplete;
              const isActiveSlot = isActiveRow && currentGuess.length === index;
              return (
                <div
                  key={`tile-${rowIndex}-${index}`}
                  className={`flex min-h-[2.5rem] flex-1 items-center justify-center border-b-2 text-base font-semibold uppercase sm:min-h-[2.75rem] sm:text-lg ${getUnderlineClass(
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
          <p className="text-center text-xs text-white/70 sm:text-sm">
            {message}
          </p>
        )}
      </div>

      {isRoundComplete && (
        <p className="text-center text-xs uppercase tracking-[0.2em] text-white/50">
          Ready for the next word
        </p>
      )}

      <div className="mt-auto w-full max-w-md space-y-2 min-h-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {[
          ["A", "B", "C", "D", "E", "F", "G"],
          ["H", "I", "J", "K", "L", "M", "N"],
          ["O", "P", "Q", "R", "S", "T", "U"],
          ["V", "W", "X", "Y", "Z", "DEL", "ENTER"],
        ].map((row, rowIndex) => (
          <div key={`kb-row-${rowIndex}`} className="grid grid-cols-7 gap-2">
            {row.map((key) => {
              if (key === "DEL") {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={handleDelete}
                    className="min-h-[2.5rem] rounded-md border border-white/20 bg-white/5 text-white sm:min-h-[2.75rem]"
                    aria-label="Delete"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="mx-auto h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M10 5L4 12L10 19H20A2 2 0 0 0 22 17V7A2 2 0 0 0 20 5H10Z" />
                      <path d="M14 9L18 13" />
                      <path d="M18 9L14 13" />
                    </svg>
                  </button>
                );
              }
              if (key === "ENTER") {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={submitHandler}
                    className={`min-h-[2.5rem] rounded-md sm:min-h-[2.75rem] ${
                      isRoundComplete
                        ? "bg-white text-black"
                        : canSubmit
                          ? "bg-white text-black"
                          : "bg-white/40 text-black/60"
                    }`}
                    disabled={!isRoundComplete && !canSubmit}
                    aria-label={submitLabel}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="mx-auto h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12H19" />
                      <path d="M13 6L19 12L13 18" />
                    </svg>
                  </button>
                );
              }

              const status = letterStatuses[key];
              const statusClass = status
                ? getTileClass(status, true)
                : "border-white/15 bg-white/5";

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLetter(key)}
                  className={`min-h-[2.5rem] rounded-md border text-xs font-semibold sm:min-h-[2.75rem] sm:text-sm ${statusClass}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {(isCorrectSolved || isFailedRound) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-xs rounded-2xl border border-white/20 bg-black/90 p-6 text-center text-white shadow-2xl">
            {isCorrectSolved ? (
              <>
                <p className="text-lg font-semibold">You spelled</p>
                <p className="mt-2 text-2xl font-extrabold tracking-[0.2em]">
                  {targetWord}
                </p>
                <p className="mt-1 text-lg font-semibold">right!</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">Nice try!</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/70">
                  The word was
                </p>
                <p className="mt-2 text-2xl font-extrabold tracking-[0.2em]">
                  {targetWord}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={submitHandler}
              className="mt-5 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-black"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSpellingGame;
