import React, { useEffect, useMemo, useRef, useState } from "react";
import tomoIcon from "../../../assets/img/tomo.svg";
import tomoSpellingIcon from "../../../assets/img/tomo-spelling.png";
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
    return "border-[#5a5550] bg-[#2f2b2f]";
  }
  if (status === "correct") {
    return "border-[#81906B] bg-[#6F7A5C] text-[#E9DFC7]";
  }
  if (status === "present") {
    return "border-[#DBAE54] bg-[#C59A41] text-[#2a2629]";
  }
  if (status === "absent") {
    return "border-[#4f4a45] bg-[#2f2b2f] text-[#9c9287]";
  }
  return "border-[#5a5550] bg-[#2f2b2f]";
};

const getUnderlineClass = (status: LetterStatus, filled: boolean) => {
  if (!filled) {
    return "border-[#5a5550] text-[#efe6d6]";
  }
  if (status === "correct") return "border-[#8fb29a] text-[#efe6d6]";
  if (status === "present") return "border-[#d2a84f] text-[#efe6d6]";
  if (status === "absent") return "border-[#4f4a45] text-[#9c9287]";
  return "border-[#5a5550] text-[#efe6d6]";
};

const getLetterClass = (status: LetterStatus, filled: boolean) => {
  if (!filled) {
    return "text-transparent";
  }
  if (status === "correct") return "text-[#8fb29a]";
  if (status === "present") return "text-[#d2a84f]";
  if (status === "absent") return "text-[#9c9287]";
  return "text-[#efe6d6]";
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
  const clickCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [playLocked, setPlayLocked] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const pressedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayedQuote, setDisplayedQuote] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isRoundComplete = isCorrectSolved || attempts.length >= MAX_ATTEMPTS;
  const isFailedRound = attempts.length >= MAX_ATTEMPTS && !isCorrectSolved;
  const canSubmit = currentGuess.length === targetWord.length;
  const attemptQuote = (() => {
    if (canSubmit && !isRoundComplete) return "Time to send!";
    if (!hasPlayedCurrent)
      return `Word ${currentWordIndex + 1}—now listen closely.`;
    if (attempts.length === 0) return "First try—type in the spelling.";
    if (attempts.length === 1) return "Second try—type in the spelling.";
    if (isCorrectSolved) return "You did it! Great listening.";
    return "Last try—give it your best!";
  })();

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplayedQuote(attemptQuote);
      return;
    }

    setDisplayedQuote("");
    let index = 0;
    const typeNext = () => {
      index += 1;
      setDisplayedQuote(attemptQuote.slice(0, index));
      if (index < attemptQuote.length) {
        typingTimeoutRef.current = setTimeout(typeNext, 28);
      }
    };
    typingTimeoutRef.current = setTimeout(typeNext, 120);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [attemptQuote]);

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

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("canplaythrough", handleLoaded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("canplaythrough", handleLoaded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
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
      setIsPlaying(true);
      setSpinKey((prev) => prev + 1);
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      playbackTimeoutRef.current = setTimeout(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
      }, WORD_INTERVAL_SECONDS * 1000);
    } catch (error) {
      console.warn("Failed to play spelling audio:", error);
    }
  };

  const handlePlayClick = () => {
    if (playLocked) return;
    playWordAtIndex(currentWordIndex);
    setPlayLocked(true);
    if (clickCooldownRef.current) {
      clearTimeout(clickCooldownRef.current);
    }
    clickCooldownRef.current = setTimeout(() => {
      setPlayLocked(false);
    }, 2000);
  };

  useEffect(() => {
    if (!audioReady || pendingSeekRef.current === null) return;
    const index = pendingSeekRef.current;
    pendingSeekRef.current = null;
    playWordAtIndex(index);
  }, [audioReady]);

  const currentRow = useMemo(() => {
    const wordLength = targetWord.length;
    return {
      guess: currentGuess.padEnd(wordLength, " "),
      statuses: Array.from({ length: wordLength }, () => "empty"),
    };
  }, [currentGuess, targetWord]);

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

  const pressKey = (key: string) => {
    setPressedKey(key);
    if (pressedTimeoutRef.current) {
      clearTimeout(pressedTimeoutRef.current);
    }
  };

  const releaseKey = () => {
    pressedTimeoutRef.current = setTimeout(() => {
      setPressedKey(null);
    }, 160);
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
      setIsPlaying(false);
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
      setIsPlaying(false);
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
    setIsPlaying(false);
    setSpinKey((prev) => prev + 1);
    setPlayLocked(false);
    setPressedKey(null);
    if (pressedTimeoutRef.current) {
      clearTimeout(pressedTimeoutRef.current);
      pressedTimeoutRef.current = null;
    }
    if (clickCooldownRef.current) {
      clearTimeout(clickCooldownRef.current);
      clickCooldownRef.current = null;
    }
  };

  const spinDurationSeconds = 0.4 + targetWord.length * 0.2;
  const isLastWord = currentWordIndex === words.length - 1;
  const correctCount = wordResults.filter(
    (result) => result === "correct",
  ).length;

  const keyRotations = useMemo(() => {
    const entries: Record<string, number> = {};
    const allKeys = [
      ...Array.from({ length: 26 }, (_, idx) =>
        String.fromCharCode(65 + idx),
      ),
      "DEL",
    ];
    allKeys.forEach((key) => {
      const magnitude = 0.5 + Math.random() * 0.5;
      const sign = Math.random() < 0.5 ? -1 : 1;
      entries[key] = sign * magnitude;
    });
    return entries;
  }, []);
  const submitLabel = "Submit";
  const submitHandler = isRoundComplete
    ? () => {
        if (isLastWord) return;
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
    <div className="relative flex min-h-full w-full flex-1 flex-col items-center gap-3 bg-[#2F2C2F] px-4 py-4 text-[#efe6d6] sm:gap-4 sm:px-6 sm:py-6">
      <div className="relative flex w-full max-w-md items-center gap-3">
        <span className="text-[0.6rem] font-semibold tracking-[0.3em] text-[#d8cdbd]">
          WORDS
        </span>
        <div className="relative flex-1">
          <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#6f6a63]" />
          <div className="relative flex w-full items-center justify-between gap-2 py-2">
            {words.map((_, index) => {
              const isActive = index === currentWordIndex;
              const result = wordResults[index];
              const dotColor =
                result === "correct"
                  ? "bg-[#8fb29a]"
                  : result === "wrong"
                    ? "bg-[#d2a84f]"
                    : "bg-[#d8cdbd]";
              return (
                <div
                  key={`word-step-${index}`}
                  className="relative flex flex-shrink-0 items-center justify-center"
                >
                  {isActive ? (
                    <img
                      src={tomoIcon}
                      alt=""
                      className="h-6 w-auto"
                    />
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-5 sm:gap-6">
        <button
          type="button"
          onClick={handlePlayClick}
          className={`flex min-h-[3.25rem] min-w-[10rem] items-center justify-center gap-2 rounded-full border-2 border-[#DACDB9] px-6 text-sm font-bold uppercase tracking-wide shadow-[0_10px_22px_rgba(0,0,0,0.45)] transition sm:min-h-[3.5rem] sm:min-w-[12rem] ${
            playLocked ? "opacity-70" : ""
          } ${
            hasPlayedCurrent
              ? "bg-[#C0B095] text-[#2a2629]"
              : "bg-[#C0B095] text-[#2a2629] animate-pulse"
          }`}
          aria-label="Listen"
          disabled={playLocked}
        >
          {hasPlayedCurrent ? (
            <svg
              key={`replay-${spinKey}`}
              viewBox="0 0 24 24"
              className={`h-7 w-7 sm:h-8 sm:w-8 ${
                isPlaying ? "slow-spin" : ""
              }`}
              style={
                isPlaying
                  ? { animationDuration: `${spinDurationSeconds}s` }
                  : undefined
              }
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
              key={`play-${spinKey}`}
              viewBox="0 0 24 24"
              className={`h-7 w-7 sm:h-8 sm:w-8 ${
                isPlaying ? "slow-spin" : ""
              }`}
              style={
                isPlaying
                  ? { animationDuration: `${spinDurationSeconds}s` }
                  : undefined
              }
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5.5L18.5 12L8 18.5V5.5Z" />
            </svg>
          )}
          <span>Listen</span>
        </button>
      </div>

      <div className="relative w-full max-w-md flex-1 min-h-0">
        <div className="relative z-10 flex h-full items-center">
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full gap-2">
              {currentRow.guess.split("").map((letter, index) => {
                const filled = letter.trim().length > 0;
                const isActiveSlot = currentGuess.length === index;
                return (
                  <div
                    key={`tile-${index}`}
                    className={`flex min-h-[2.5rem] flex-1 items-center justify-center border-b-2 text-base font-semibold uppercase sm:min-h-[2.75rem] sm:text-lg ${getUnderlineClass(
                      "empty",
                      filled,
                    )} ${isActiveSlot ? "!border-[#efe6d6] !text-[#efe6d6]" : ""}`}
                  >
                    {letter.trim()}
                  </div>
                );
              })}
            </div>
            {[...attempts].reverse().map((attempt, index) => {
              const opacity =
                index === 0 ? "opacity-100" : index === 1 ? "opacity-70" : "opacity-50";
              return (
                <div
                  key={`attempt-${attempts.length - 1 - index}`}
                  className={`flex w-full gap-2 ${opacity} animate-fade-in`}
                >
                  {Array.from({ length: targetWord.length }).map((_, letterIndex) => {
                    const letter = attempt.guess[letterIndex] ?? " ";
                    const status = attempt.statuses[letterIndex] ?? "empty";
                    const filled = letter.trim().length > 0;
                    return (
                      <div
                        key={`attempt-${attempts.length - 1 - index}-tile-${letterIndex}`}
                        className={`flex min-h-[2.25rem] flex-1 items-center justify-center text-sm font-semibold uppercase sm:min-h-[2.5rem] sm:text-base ${getLetterClass(
                          status,
                          filled,
                        )}`}
                      >
                        {letter.trim()}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full max-w-md">
        {message && (
          <p className="text-center text-xs text-[#d8cdbd] sm:text-sm">
            {message}
          </p>
        )}
      </div>

      {isRoundComplete && (
        <p className="text-center text-xs uppercase tracking-[0.2em] text-[#c6b9aa]">
          Ready for the next word
        </p>
      )}

      <div className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <img
            src={tomoSpellingIcon}
            alt=""
            className="h-16 w-auto"
          />
          <div className="relative flex-1">
            <span className="absolute left-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-[#4a4345]" />
            <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#4a4345] px-3 py-2 text-base font-semibold tracking-[0.08em] text-[#efe6d6] shadow-[0_3px_0_#262224] sm:text-lg">
              <span
                className="flex-1"
                style={{
                  minHeight: "2.75rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
              {displayedQuote}
              </span>
              {(canSubmit || isRoundComplete) && (
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    pressKey("SUBMIT");
                    submitHandler();
                  }}
                  onPointerUp={releaseKey}
                  onPointerLeave={releaseKey}
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#DACDB9] shadow-[0_6px_0_#766a5b] transition ${
                    isRoundComplete
                      ? "bg-[#C0B095] text-[#2a2629]"
                      : "bg-[#C0B095] text-[#2a2629]"
                  } ${pressedKey === "SUBMIT" ? "bg-[#c9ba9f] text-[#2a2629]" : ""}`}
                  aria-label={submitLabel}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12H19" />
                    <path d="M13 6L19 12L13 18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="tap-safe mt-auto w-full max-w-md space-y-2 min-h-0 pb-[env(safe-area-inset-bottom)] overflow-visible">
        <div
          className="relative space-y-2 overflow-visible"
          style={
            {
              "--key-size": "clamp(2.2rem, 7.5vw, 2.8rem)",
              "--key-height": "clamp(3.4rem, 9vw, 4rem)",
            } as React.CSSProperties
          }
        >
          {[
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
            ["Z", "X", "C", "V", "B", "N", "M", "DEL"],
          ].map((row, rowIndex) => {
            const renderKey = (key: string) => {
              if (key === "DEL") {
                const isPressed = pressedKey === "DEL";
                const rotation = keyRotations[key] ?? 0;
                return (
                  <button
                    key={key}
                    type="button"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      pressKey("DEL");
                      handleDelete();
                    }}
                    onPointerUp={releaseKey}
                    onPointerLeave={releaseKey}
                    className={`h-[var(--key-height)] w-[var(--key-size)] select-none rounded-md border-2 border-[#584D49] text-[#E2D7BB] shadow-[0_4px_0_#1f1b1d] transition ${
                      isPressed ? "bg-[#e5dac7] text-[#2a2629]" : "bg-[#393335]"
                    }`}
                    style={{ transform: `rotate(${rotation}deg)` }}
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

              const status = letterStatuses[key];
              const statusClass = status
                ? getTileClass(status, true)
                : "border-[#584D49] bg-[#393335]";
              const isPressed = pressedKey === key;
              const rotation = keyRotations[key] ?? 0;

              return (
                <button
                  key={key}
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    pressKey(key);
                    handleLetter(key);
                  }}
                  onPointerUp={releaseKey}
                  onPointerLeave={releaseKey}
                  className={`h-[var(--key-height)] w-[var(--key-size)] select-none rounded-md border-2 text-[0.85rem] font-semibold shadow-[0_4px_0_#1f1b1d] transition sm:text-base ${
                    isPressed ? "bg-[#e5dac7] text-[#2a2629]" : statusClass
                  }`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {key}
                </button>
              );
            };

            return (
              <div
                key={`kb-row-${rowIndex}`}
                className="flex w-full justify-center gap-1"
              >
                {row.map(renderKey)}
              </div>
            );
          })}
        </div>
      </div>
      {(isCorrectSolved || isFailedRound) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-xs rounded-2xl border border-[#6b6256] bg-[#2f2b2d] p-6 text-center text-[#efe6d6] shadow-2xl">
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
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#d8cdbd]">
                  The word was
                </p>
                <p className="mt-2 text-2xl font-extrabold tracking-[0.2em]">
                  {targetWord}
                </p>
              </>
            )}
            {isLastWord ? (
              <p className="mt-5 text-sm font-semibold text-white">
                Congratulations! You got {correctCount} on {words.length} right
              </p>
            ) : (
              <button
                type="button"
                onClick={submitHandler}
                className="mt-5 w-full rounded-full bg-[#efe6d6] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#2a2629]"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSpellingGame;
