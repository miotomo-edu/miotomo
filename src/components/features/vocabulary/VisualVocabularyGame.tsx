import React, { useEffect, useMemo, useRef, useState } from "react";
import tomoIcon from "../../../assets/img/tomo.svg";
import tomoSpellingIcon from "../../../assets/img/tomo-spelling.png";
import { supabase } from "../../../hooks/integrations/supabase/client";

type Attempt = {
  text: string;
  correct: boolean;
};

type VocabItem = {
  wordId: string;
  targetWord: string;
  contextText: string;
  contextAudioUrl: string;
  tomoPromptText: string;
  feedbackTextMap: Record<string, string>;
  language?: string | null;
};

const TEST_CIRCLE_ID = "ff7f12ca-78e4-4987-9d2c-63a68694a1b1";
const TEST_DOT = 1;
const MAX_ATTEMPTS = 3;
const SAMPLE_RATE = 16000;
const buildWsUrl = (targetWord: string) => {
  const encoded = encodeURIComponent((targetWord || "").toLowerCase());
  return `ws://localhost:8000/v1/vocab/grade?sample_rate=${SAMPLE_RATE}&target_word=${encoded}`;
};

const parseFeedbackTextMap = (value: unknown) => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    } catch (err) {
      console.warn("Failed to parse feedback_text_map:", err);
    }
    return null;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string>;
  }
  return null;
};

const VisualVocabularyGame: React.FC = () => {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [targetWord, setTargetWord] = useState("");
  const [contextText, setContextText] = useState("");
  const [contextAudioUrl, setContextAudioUrl] = useState("");
  const [tomoPromptText, setTomoPromptText] = useState("");
  const [rawTargetWord, setRawTargetWord] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [message, setMessage] = useState("");
  const [isCorrectSolved, setIsCorrectSolved] = useState(false);
  const [wordResults, setWordResults] = useState<
    Array<"correct" | "wrong" | null>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [displayedQuote, setDisplayedQuote] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [phase, setPhase] = useState<
    "listen" | "revealed" | "recording" | "grading" | "feedback"
  >("listen");
  const [feedbackTextMap, setFeedbackTextMap] = useState<
    Record<string, string>
  >({});
  const [feedbackKey, setFeedbackKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const sentChunkCountRef = useRef(0);
  const logIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTranscriptRef = useRef("");

  const attemptQuote = useMemo(() => {
    const feedbackMessage = feedbackKey
      ? (feedbackTextMap[feedbackKey] ?? "")
      : "";
    if (feedbackKey && (phase === "feedback" || phase === "revealed")) {
      return feedbackMessage;
    }
    if (message) return message;
    if (phase === "listen") return "Tap listen to hear about the word.";
    if (phase === "revealed") return tomoPromptText || "Say the word.";
    if (phase === "recording") return "Listening…";
    if (phase === "grading") return "Grading…";
    if (phase === "feedback") return tomoPromptText || "Say the word.";
    return tomoPromptText || "Say the word.";
  }, [feedbackKey, feedbackTextMap, message, phase, tomoPromptText]);

  useEffect(() => {
    let isActive = true;

    const fetchWords = async () => {
      setIsLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from("vocab_items")
        .select(
          "word_id,target_word,context_text,context_audio_url,tomo_prompt_text,language,feedback_text_map,active,created_at,index",
        )
        .eq("circle_id", TEST_CIRCLE_ID)
        .eq("dot", TEST_DOT)
        .order("index", { ascending: true })
        .order("created_at", { ascending: true });

      if (!error) {
        console.log("Vocab items response", data);
      }

      if (!isActive) return;

      if (error) {
        console.error("Failed to load vocab words:", error);
        setLoadError("Unable to load vocabulary words.");
        setIsLoading(false);
        return;
      }

      const vocabItems = Array.isArray(data)
        ? data
            .filter(
              (row) =>
                typeof row?.target_word === "string" &&
                row.target_word.length > 0,
            )
            .map((row) => ({
              wordId: row.word_id,
              targetWord: row.target_word,
              contextText: row.context_text || "",
              contextAudioUrl: row.context_audio_url || "",
              tomoPromptText: row.tomo_prompt_text || "",
              feedbackTextMap:
                parseFeedbackTextMap(row.feedback_text_map) ?? {},
              language: row.language ?? null,
            }))
        : [];

      setItems(vocabItems);
      setCurrentWordIndex(0);
      setTargetWord(vocabItems[0]?.targetWord?.toUpperCase() ?? "");
      setRawTargetWord(vocabItems[0]?.targetWord ?? "");
      setContextText(vocabItems[0]?.contextText ?? "");
      setContextAudioUrl(vocabItems[0]?.contextAudioUrl ?? "");
      setTomoPromptText(vocabItems[0]?.tomoPromptText ?? "");
      setFeedbackTextMap(vocabItems[0]?.feedbackTextMap ?? {});
      setPhase("listen");
      setWordResults(Array.from({ length: vocabItems.length }, () => null));
      setAttempts([]);
      setIsCorrectSolved(false);
      setFeedbackKey(null);
      setHasListened(false);
      setIsLoading(false);
    };

    fetchWords();

    return () => {
      isActive = false;
    };
  }, []);

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

  const stopMicCapture = () => {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (err) {
        console.warn("Failed to stop MediaRecorder:", err);
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const stopRecording = async (sendClose = true) => {
    console.log("Vocab mic: stopping");
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current);
      logIntervalRef.current = null;
    }
    stopMicCapture();
    if (wsRef.current) {
      try {
        if (sendClose && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send("close");
        }
        wsRef.current.close();
      } catch (err) {
        console.warn("Failed to close vocab socket:", err);
      }
      wsRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopRecording(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleListen = () => {
    if (!contextAudioUrl) {
      setHasListened(true);
      setPhase("revealed");
      return;
    }
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = contextAudioUrl;
    audio.preload = "auto";
    audio.currentTime = 0;
    audio.onended = () => {
      setIsPlaying(false);
      setHasListened(true);
      setPhase("revealed");
    };
    audio.onerror = () => {
      console.warn("Failed to load context audio");
      setIsPlaying(false);
      setHasListened(true);
      setPhase("revealed");
    };
    setIsPlaying(true);
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setIsPlaying(false);
        setHasListened(true);
        setPhase("revealed");
      });
    }
  };

  const startRecording = async () => {
    if (isRecording || phase !== "revealed") return;
    console.log("Vocab mic: starting");
    setMessage("");
    setFeedbackKey(null);
    setPhase("recording");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: SAMPLE_RATE,
        },
      });
      lastTranscriptRef.current = "";
      streamRef.current = stream;

      const ws = new WebSocket(buildWsUrl(targetWord));
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;
      sentChunkCountRef.current = 0;
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
      }
      logIntervalRef.current = setInterval(() => {
        if (!wsRef.current) return;
        console.log(
          "Vocab ws status",
          "sent",
          sentChunkCountRef.current,
          "state",
          wsRef.current.readyState,
          "buffered",
          wsRef.current.bufferedAmount,
        );
      }, 1000);

      ws.onopen = () => {
        console.log("Vocab ws: open");
        ws.send(
          JSON.stringify({
            type: "start",
            target_word: (targetWord || "").toLowerCase(),
            language: "en",
          }),
        );
      };

      ws.onmessage = (event) => {
        if (typeof event.data !== "string") return;
        try {
          const payload = JSON.parse(event.data);
          if (payload?.type === "status" && payload?.stage === "grading") {
            stopMicCapture();
            setIsGrading(true);
            setPhase("grading");
            return;
          }
          if (payload?.type === "transcript") {
            if (payload.text) {
              console.log("Vocab transcript:", payload.text);
              lastTranscriptRef.current = payload.text;
            }
            if (payload.final) {
              stopMicCapture();
            }
            return;
          }
          if (typeof payload?.transcript === "string") {
            console.log("Vocab transcript:", payload.transcript);
            lastTranscriptRef.current = payload.transcript;
          }
          if (typeof payload?.feedback_key === "string") {
            console.log("Vocab feedback_key:", payload.feedback_key);
            const feedbackKey = payload.feedback_key;
            setFeedbackKey(feedbackKey);
            const isSuccess = feedbackKey === "success_clear";
            setIsGrading(false);
            setMessage("");
            const attemptText =
              typeof payload?.transcript === "string"
                ? payload.transcript
                : lastTranscriptRef.current;
            const nextAttempts = [
              ...attempts,
              { text: attemptText, correct: isSuccess },
            ];
            setAttempts(nextAttempts);
            if (isSuccess && !isCorrectSolved) {
              setIsCorrectSolved(true);
              setWordResults((prev) => {
                const next = [...prev];
                next[currentWordIndex] = "correct";
                return next;
              });
            } else if (!isSuccess && nextAttempts.length >= MAX_ATTEMPTS) {
              setWordResults((prev) => {
                const next = [...prev];
                next[currentWordIndex] = "wrong";
                return next;
              });
            }
            setPhase(isSuccess ? "feedback" : "revealed");
            stopRecording();
            return;
          }
          if (typeof payload?.outcome === "string") {
            console.log("Vocab outcome:", payload.outcome);
          }
          if (Array.isArray(payload?.tags)) {
            setIsGrading(false);
            console.log("Vocab tags:", payload.tags);
          }
        } catch (err) {
          console.warn("Failed to parse vocab response:", err);
        }
      };

      ws.onerror = () => {
        console.warn("Vocab ws: error");
        setMessage("Audio connection failed. Try again.");
        stopRecording(false);
      };

      ws.onclose = () => {
        console.log("Vocab ws: closed");
        setIsRecording(false);
      };

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = recorder;
      recorder.onstart = () => {
        console.log("Vocab recorder: started");
      };
      recorder.onstop = () => {
        console.log("Vocab recorder: stopped");
      };
      recorder.ondataavailable = (event) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }
        if (event.data.size > 0) {
          if (wsRef.current.bufferedAmount > 512 * 1024) {
            return;
          }
          wsRef.current.send(event.data);
          sentChunkCountRef.current += 1;
          if (sentChunkCountRef.current % 10 === 0) {
            console.log("Vocab ws: sent chunks", sentChunkCountRef.current);
          }
        }
      };
      recorder.start(250);
      setIsRecording(true);
    } catch (err) {
      console.warn("Failed to start vocab mic:", err);
      setMessage("Microphone access is required.");
      stopRecording(false);
    }
  };

  const handleNextWord = () => {
    if (!items.length) return;
    const nextIndex = (currentWordIndex + 1) % items.length;
    setCurrentWordIndex(nextIndex);
    setTargetWord(items[nextIndex]?.targetWord?.toUpperCase() ?? "");
    setRawTargetWord(items[nextIndex]?.targetWord ?? "");
    setContextText(items[nextIndex]?.contextText ?? "");
    setContextAudioUrl(items[nextIndex]?.contextAudioUrl ?? "");
    setTomoPromptText(items[nextIndex]?.tomoPromptText ?? "");
    setFeedbackTextMap(items[nextIndex]?.feedbackTextMap ?? {});
    setAttempts([]);
    setIsGrading(false);
    setIsCorrectSolved(false);
    setMessage("");
    setPhase("listen");
    setFeedbackKey(null);
    setHasListened(false);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const isLastWord = currentWordIndex === items.length - 1;
  const correctCount = wordResults.filter(
    (result) => result === "correct",
  ).length;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <span className="text-sm uppercase tracking-[0.2em] text-white/60">
          Loading vocab...
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
          No vocab words available.
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full w-full flex-1 flex-col items-center gap-3 bg-[#2F2C2F] px-4 py-4 text-[#efe6d6] sm:gap-4 sm:px-6 sm:py-6">
      <div className="relative flex w-full max-w-3xl items-center gap-3">
        <span className="text-[0.6rem] font-semibold tracking-[0.3em] text-[#d8cdbd] sm:text-xs md:text-xl">
          WORDS
        </span>
        <div className="relative flex-1">
          <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#6f6a63] md:h-1.5" />
          <div className="relative flex w-full items-center justify-between gap-2 py-2 md:py-4">
            {items.map((_, index) => {
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
                  key={`vocab-step-${index}`}
                  className="relative flex flex-shrink-0 items-center justify-center"
                >
                  {isActive ? (
                    <img src={tomoIcon} alt="" className="h-6 w-auto md:h-10" />
                  ) : (
                    <span
                      className={`h-2 w-2 rounded-full md:h-4 md:w-4 ${dotColor}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {phase === "listen" && !isRecording && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <button
            type="button"
            onClick={handleListen}
            disabled={isPlaying}
            className={`flex h-16 items-center justify-center rounded-full border-2 border-[#DACDB9] bg-[#C0B095] px-10 text-xl font-semibold uppercase tracking-wide text-[#2a2629] transition sm:h-18 sm:text-2xl md:h-20 md:text-3xl ${
              isPlaying
                ? "cursor-not-allowed opacity-70"
                : "hover:brightness-105"
            }`}
          >
            Listen
          </button>
        </div>
      )}

      <div
        className={`flex w-full max-w-3xl flex-col items-center gap-5 text-center sm:gap-6 ${
          phase === "listen" ? "pointer-events-none" : "mt-10 sm:mt-12"
        }`}
      >
        <div className="flex w-full flex-col items-center gap-3 md:gap-4">
          <div className="flex w-full items-center justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 text-3xl font-bold text-[#efe6d6] md:text-5xl">
              <span className="inline">
                {phase === "listen" ? (
                  <span className="opacity-0">“{contextText}”</span>
                ) : (
                  <>
                    {(() => {
                      if (!rawTargetWord) return `“${contextText}”`;
                      const lowerText = contextText.toLowerCase();
                      const lowerTarget = rawTargetWord.toLowerCase();
                      const matchIndex = lowerText.indexOf(lowerTarget);
                      if (matchIndex === -1) {
                        return `“${contextText}”`;
                      }
                      const beforeText = contextText.slice(0, matchIndex);
                      const matchText = contextText.slice(
                        matchIndex,
                        matchIndex + rawTargetWord.length,
                      );
                      const afterText = contextText.slice(
                        matchIndex + rawTargetWord.length,
                      );
                      const punctuationMatch = afterText.match(
                        /^[,.;:!?)\]]+/,
                      );
                      const trailingPunctuation = punctuationMatch
                        ? punctuationMatch[0]
                        : "";
                      const afterRest = afterText.slice(
                        trailingPunctuation.length,
                      );
                      return (
                        <>
                          <span>{`“${beforeText}`}</span>
                          <span className="text-[#C59A41]">
                            {matchText}
                            {trailingPunctuation ? (
                              <span className="text-[#efe6d6]">
                                {trailingPunctuation}
                              </span>
                            ) : null}
                          </span>
                          <span>{`${afterRest}”`}</span>
                        </>
                      );
                    })()}
                  </>
                )}
              </span>
              {phase === "revealed" && !isRecording && (
                <button
                  type="button"
                  onClick={handleListen}
                  disabled={isPlaying}
                  className={`flex h-10 w-10 items-center justify-center text-[#efe6d6] transition sm:h-12 sm:w-12 md:h-16 md:w-16 ${
                    isPlaying
                      ? "cursor-not-allowed opacity-70"
                      : "hover:brightness-105"
                  }`}
                  aria-label={
                    hasListened ? "Replay sentence" : "Listen to sentence"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7 md:h-9 md:w-9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <polyline points="3 4 3 10 9 10" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {rawTargetWord && phase !== "listen" && (
        <div className="absolute left-1/2 top-1/2 z-20 flex w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 text-center px-4">
          <div className="text-3xl font-semibold text-[#d8cdbd] md:text-4xl">
            What is the meaning of “{rawTargetWord}”?
          </div>
          {phase === "feedback" && (isCorrectSolved || attempts.length >= 2)
            ? !isLastWord && (
                <button
                  type="button"
                  onClick={handleNextWord}
                  className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#DACDB9] bg-white/10 text-[#efe6d6] transition md:h-32 md:w-32"
                  aria-label="Next word"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-14 w-14 md:h-16 md:w-16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )
            : (phase === "revealed" ||
                phase === "recording" ||
                (phase === "feedback" &&
                  !isCorrectSolved &&
                  attempts.length < MAX_ATTEMPTS)) && (
                <button
                  type="button"
                  onClick={isRecording ? () => stopRecording() : startRecording}
                  className={`flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#DACDB9] bg-white/10 text-[#efe6d6] transition md:h-32 md:w-32 ${
                    isRecording ? "opacity-80" : "hover:brightness-105"
                  }`}
                  aria-label={
                    isRecording ? "Stop recording" : "Start recording"
                  }
                >
                  {isRecording ? (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-14 w-14 md:h-16 md:w-16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="10" height="10" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-14 w-14 md:h-16 md:w-16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
                      <path d="M6 12a6 6 0 0 0 12 0" />
                      <path d="M12 18v4" />
                      <path d="M8 22h8" />
                    </svg>
                  )}
                </button>
              )}
        </div>
      )}

      <div className="relative w-full max-w-3xl flex-1 min-h-0">
        <div className="relative z-10 flex h-full items-center">
          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex w-full flex-col gap-3">
              {attempts.length > 0 && null}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <div className="flex items-end gap-3">
          <img
            src={tomoSpellingIcon}
            alt=""
            className="h-20 w-auto sm:h-24 md:h-32"
          />
          <div className="relative flex-1">
            <span className="absolute bottom-6 left-[-6px] h-3 w-3 rotate-45 bg-[#4a4345]" />
            <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#4a4345] px-4 py-3 text-lg font-semibold tracking-[0.08em] text-[#efe6d6] sm:text-xl md:text-3xl">
              <span
                className="flex-1 break-words"
                style={{
                  minHeight: "3.5rem",
                }}
              >
                {displayedQuote}
              </span>
            </div>
          </div>
        </div>
      </div>

      {phase === "feedback" && isLastWord && (
        <div className="mt-6 text-center text-sm text-[#d8cdbd]">
          Congratulations! You got {correctCount} on {items.length} right
        </div>
      )}
    </div>
  );
};

export default VisualVocabularyGame;
