import React, { useEffect, useMemo, useRef, useState } from "react";
import tomoIcon from "../../../assets/img/tomo.svg";
import tomoSpellingIcon from "../../../assets/img/tomo-spelling.png";
import vocabularyBackground from "../../../assets/img/vocabulary_bg.png";
import { supabase } from "../../../hooks/integrations/supabase/client";
import PreGameScreen from "../modality/PreGameScreen";
import VisualSpellingGame from "../spelling/VisualSpellingGame";
import type { PreviewScreen } from "../../../lib/previewMode";
import type { Book } from "../../sections/LibrarySection";

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
  definition: string;
  language?: string | null;
};

type VisualVocabularyGameProps = {
  onComplete?: () => void;
  previewMode?: Extract<
    PreviewScreen,
    | "vocab-intro"
    | "vocab-game"
    | "vocab-complete"
    | "spelling-intro"
    | "spelling-game"
    | "spelling-complete"
  > | null;
  selectedBook?: Book | null;
  selectedChapter?: number | null;
};

const TEST_CIRCLE_ID = "ff7f12ca-78e4-4987-9d2c-63a68694a1b1";
const TEST_DOT = 1;
const MAX_ATTEMPTS = 3;
const SAMPLE_RATE = 16000;
const RECORDING_COUNTDOWN_SECONDS = 3;
const buildWsUrl = (targetWord: string) => {
  const encoded = encodeURIComponent((targetWord || "").toLowerCase());

  return `wss://miotomo-vocabulary.onrender.com/v1/vocab/grade?sample_rate=${SAMPLE_RATE}&target_word=${encoded}`;
  // return `ws://localhost:8000/v1/vocab/grade?sample_rate=${SAMPLE_RATE}&target_word=${encoded}`;
};

const blobToHexPreview = async (blob: Blob, bytes = 8) => {
  const buffer = await blob.slice(0, bytes).arrayBuffer();
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join(" ");
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

const VisualVocabularyGame: React.FC<VisualVocabularyGameProps> = ({
  onComplete,
  previewMode = null,
  selectedBook = null,
  selectedChapter = null,
}) => {
  const isPreviewMode = Boolean(previewMode);
  const isVocabularyPreview =
    previewMode === "vocab-intro" ||
    previewMode === "vocab-game" ||
    previewMode === "vocab-complete";
  const isVocabularyCompletionPreview = previewMode === "vocab-complete";
  const isSpellingPreview =
    previewMode === "spelling-intro" ||
    previewMode === "spelling-game" ||
    previewMode === "spelling-complete";
  const isSpellingCompletionPreview = previewMode === "spelling-complete";
  const [items, setItems] = useState<VocabItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [targetWord, setTargetWord] = useState("");
  const [contextText, setContextText] = useState("");
  const [contextAudioUrl, setContextAudioUrl] = useState("");
  const [tomoPromptText, setTomoPromptText] = useState("");
  const [definition, setDefinition] = useState("");
  const [rawTargetWord, setRawTargetWord] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [message, setMessage] = useState("");
  const [isCorrectSolved, setIsCorrectSolved] = useState(false);
  const [wordResults, setWordResults] = useState<
    Array<"correct" | "wrong" | null>
  >([]);
  const [isLoading, setIsLoading] = useState(() => !previewMode);
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
  const [showIntro, setShowIntro] = useState(() => !previewMode);
  const [showSpellingGame, setShowSpellingGame] = useState(false);
  const [armingCountdown, setArmingCountdown] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const sentChunkCountRef = useRef(0);
  const logIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTranscriptRef = useRef("");
  const awaitingServerCloseRef = useRef(false);
  const wsReadyRef = useRef(false);
  const startMessageSentRef = useRef(false);
  const firstChunkLoggedRef = useRef(false);
  const stopAfterRecorderFlushRef = useRef(false);
  const sessionSequenceRef = useRef(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const countdownCompleteRef = useRef(false);

  useEffect(() => {
    if (!isPreviewMode) return;

    if (isVocabularyPreview) {
      const previewItem: VocabItem = {
        wordId: "preview-word",
        targetWord: "fossil",
        contextText:
          "A fossil can show us what ancient animals looked like millions of years ago.",
        contextAudioUrl: "",
        tomoPromptText: "Say the word: fossil.",
        feedbackTextMap: {},
        definition:
          "A fossil is the preserved remains or trace of a living thing from long ago.",
        language: "en",
      };

      setItems([previewItem]);
      setCurrentWordIndex(0);
      setTargetWord(previewItem.targetWord.toUpperCase());
      setRawTargetWord(previewItem.targetWord);
      setContextText(previewItem.contextText);
      setContextAudioUrl(previewItem.contextAudioUrl);
      setTomoPromptText(previewItem.tomoPromptText);
      setDefinition(previewItem.definition);
      setFeedbackTextMap(previewItem.feedbackTextMap);
      setPhase(
        previewMode === "vocab-game"
          ? "revealed"
          : previewMode === "vocab-complete"
            ? "feedback"
            : "listen",
      );
      setWordResults([previewMode === "vocab-complete" ? "correct" : null]);
      setAttempts([]);
      setIsCorrectSolved(previewMode === "vocab-complete");
      setMessage("");
      setFeedbackKey(null);
      setHasListened(previewMode !== "vocab-intro");
      setIsRecording(false);
      setIsGrading(false);
      setIsPlaying(false);
      setShowIntro(previewMode === "vocab-intro");
      setShowSpellingGame(false);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    if (isSpellingPreview) {
      setShowIntro(false);
      setShowSpellingGame(true);
      setIsLoading(false);
      setLoadError(null);
    }
  }, [isPreviewMode, isSpellingPreview, isVocabularyPreview, previewMode]);

  const attemptQuote = useMemo(() => {
    const reachedMax = !isCorrectSolved && attempts.length >= MAX_ATTEMPTS;
    if (reachedMax) {
      return "Hmm… I think this one is tricky.\nLet’s look at how people usually explain it.";
    }
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
  }, [
    attempts.length,
    feedbackKey,
    feedbackTextMap,
    isCorrectSolved,
    message,
    phase,
    tomoPromptText,
  ]);

  useEffect(() => {
    let isActive = true;

    const normalizeVocabRows = (data: any[] | null | undefined) =>
      Array.isArray(data)
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
              definition: row.definition || "",
              feedbackTextMap:
                parseFeedbackTextMap(row.feedback_text_map) ?? {},
              language: row.language ?? null,
            }))
        : [];

    const fetchWords = async () => {
      if (!isPreviewMode) {
        setIsLoading(true);
        setLoadError(null);
      }
      const runtimeCircleId =
        typeof selectedBook?.id === "string" && selectedBook.id.length > 0
          ? selectedBook.id
          : null;
      const runtimeDot = Number(selectedChapter);

      const loadForTarget = async (circleId: string, dot: number) =>
        supabase
          .from("vocab_items")
          .select(
            "word_id,target_word,context_text,context_audio_url,tomo_prompt_text,definition,language,feedback_text_map,active,created_at,index",
          )
          .eq("circle_id", circleId)
          .eq("dot", dot)
          .order("index", { ascending: true })
          .order("created_at", { ascending: true });

      let data = null;
      let error = null;

      if (runtimeCircleId && Number.isFinite(runtimeDot) && runtimeDot > 0) {
        const runtimeResult = await loadForTarget(runtimeCircleId, runtimeDot);
        error = runtimeResult.error;
        data = runtimeResult.data;

        const runtimeItems = normalizeVocabRows(runtimeResult.data);
        if (!runtimeResult.error && runtimeItems.length > 0) {
          data = runtimeResult.data;
        } else {
          const fallbackResult = await loadForTarget(TEST_CIRCLE_ID, TEST_DOT);
          error = fallbackResult.error;
          data = fallbackResult.data;
        }
      } else {
        const fallbackResult = await loadForTarget(TEST_CIRCLE_ID, TEST_DOT);
        error = fallbackResult.error;
        data = fallbackResult.data;
      }

      if (!error) {
        console.log("Vocab items response", data);
      }

      if (!isActive) return;

      if (error) {
        console.error("Failed to load vocab words:", error);
        if (!isPreviewMode) {
          setLoadError("Unable to load vocabulary words.");
          setIsLoading(false);
        }
        return;
      }

      const vocabItems = normalizeVocabRows(data);

      setItems(vocabItems);
      setCurrentWordIndex(0);
      setTargetWord(vocabItems[0]?.targetWord?.toUpperCase() ?? "");
      setRawTargetWord(vocabItems[0]?.targetWord ?? "");
      setContextText(vocabItems[0]?.contextText ?? "");
      setContextAudioUrl(vocabItems[0]?.contextAudioUrl ?? "");
      setTomoPromptText(vocabItems[0]?.tomoPromptText ?? "");
      setDefinition(vocabItems[0]?.definition ?? "");
      setFeedbackTextMap(vocabItems[0]?.feedbackTextMap ?? {});
      setPhase(
        isVocabularyPreview
          ? previewMode === "vocab-game"
            ? "revealed"
            : previewMode === "vocab-complete"
              ? "feedback"
              : "listen"
          : "listen",
      );
      setWordResults(
        Array.from({ length: vocabItems.length }, () =>
          previewMode === "vocab-complete" ? "correct" : null,
        ),
      );
      setAttempts([]);
      setIsCorrectSolved(previewMode === "vocab-complete");
      setFeedbackKey(null);
      setHasListened(previewMode !== "vocab-intro");
      setIsLoading(false);
    };

    fetchWords();

    return () => {
      isActive = false;
    };
  }, [
    isPreviewMode,
    isVocabularyPreview,
    previewMode,
    selectedBook?.id,
    selectedChapter,
  ]);

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

  const closeSocketImmediately = (socket: WebSocket, sendClose: boolean) => {
    awaitingServerCloseRef.current = false;
    wsReadyRef.current = false;
    startMessageSentRef.current = false;
    wsRef.current = null;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    if (sendClose && socket.readyState === WebSocket.OPEN) {
      socket.send("close");
    }
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close();
    }
  };

  const clearWsStatusInterval = () => {
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current);
      logIntervalRef.current = null;
    }
  };

  const clearRecordingCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    countdownCompleteRef.current = false;
    setArmingCountdown(null);
  };

  const resetForRetry = (nextMessage: string) => {
    clearWsStatusInterval();
    clearRecordingCountdown();
    stopMicCapture();
    awaitingServerCloseRef.current = false;
    stopAfterRecorderFlushRef.current = false;
    wsReadyRef.current = false;
    startMessageSentRef.current = false;
    setIsGrading(false);
    setFeedbackKey(null);
    setMessage(nextMessage);
    setPhase("revealed");
  };

  const stopRecording = async (
    sendClose = true,
    awaitServerResponse = false,
  ) => {
    console.log("Vocab mic: stopping");
    if (wsRef.current) {
      const socket = wsRef.current;
      try {
        const recorder = mediaRecorderRef.current;
        const recorderIsActive = recorder && recorder.state !== "inactive";

        if (awaitServerResponse && recorderIsActive) {
          stopAfterRecorderFlushRef.current = true;
          awaitingServerCloseRef.current = true;
          setIsGrading(true);
          setPhase("grading");
          stopMicCapture();
          return;
        }

        clearWsStatusInterval();
        stopMicCapture();

        if (
          sendClose &&
          awaitServerResponse &&
          socket.readyState === WebSocket.OPEN
        ) {
          awaitingServerCloseRef.current = true;
          setIsGrading(true);
          setPhase("grading");
          socket.send("close");
          return;
        }

        closeSocketImmediately(socket, sendClose);
      } catch (err) {
        console.warn("Failed to close vocab socket:", err);
      }
      return;
    }

    clearWsStatusInterval();
    clearRecordingCountdown();
    stopMicCapture();
    awaitingServerCloseRef.current = false;
    stopAfterRecorderFlushRef.current = false;
    wsReadyRef.current = false;
    startMessageSentRef.current = false;
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
    if (isRecording || (phase !== "revealed" && phase !== "feedback")) return;
    sessionSequenceRef.current += 1;
    const sessionId = sessionSequenceRef.current;
    console.log(`[Vocab ${sessionId}] starting session`);
    setMessage("");
    setFeedbackKey(null);
    setPhase("recording");
    setIsGrading(false);
    firstChunkLoggedRef.current = false;
    stopAfterRecorderFlushRef.current = false;
    awaitingServerCloseRef.current = false;
    wsReadyRef.current = false;
    startMessageSentRef.current = false;
    clearRecordingCountdown();
    setArmingCountdown(RECORDING_COUNTDOWN_SECONDS);

    try {
      const maybeStartRecorder = () => {
        const recorder = mediaRecorderRef.current;
        if (
          recorder &&
          recorder.state === "inactive" &&
          wsReadyRef.current &&
          startMessageSentRef.current &&
          countdownCompleteRef.current
        ) {
          console.log(
            `[Vocab ${sessionId}] recorder starting after handshake + countdown`,
          );
          recorder.start(250);
        }
      };

      countdownIntervalRef.current = setInterval(() => {
        setArmingCountdown((current) => {
          if (current === null) return current;
          if (current <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            countdownCompleteRef.current = true;
            maybeStartRecorder();
            return null;
          }
          return current - 1;
        });
      }, 1000);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: SAMPLE_RATE,
        },
      });
      lastTranscriptRef.current = "";
      streamRef.current = stream;

      console.log(
        `[Vocab ${sessionId}] socket created`,
        buildWsUrl(targetWord),
      );
      const ws = new WebSocket(buildWsUrl(targetWord));
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;
      sentChunkCountRef.current = 0;
      clearWsStatusInterval();
      logIntervalRef.current = setInterval(() => {
        if (!wsRef.current) return;
        console.log(
          `[Vocab ${sessionId}] ws status`,
          "sent",
          sentChunkCountRef.current,
          "state",
          wsRef.current.readyState,
          "buffered",
          wsRef.current.bufferedAmount,
        );
      }, 1000);

      ws.onopen = () => {
        console.log(`[Vocab ${sessionId}] socket open`);
        wsReadyRef.current = true;
        const startPayload = JSON.stringify({
          type: "start",
          target_word: (targetWord || "").toLowerCase(),
          language: "en",
        });
        ws.send(startPayload);
        startMessageSentRef.current = true;
        console.log(`[Vocab ${sessionId}] start message sent`, startPayload);

        maybeStartRecorder();
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
          if (typeof payload?.error === "string" && payload.error.length > 0) {
            console.warn("Vocab backend error:", payload.error);
            awaitingServerCloseRef.current = false;
            stopAfterRecorderFlushRef.current = false;
            wsReadyRef.current = false;
            startMessageSentRef.current = false;
            clearRecordingCountdown();
            if (wsRef.current === ws) {
              wsRef.current = null;
            }
            try {
              if (
                ws.readyState === WebSocket.OPEN ||
                ws.readyState === WebSocket.CONNECTING
              ) {
                ws.close();
              }
            } catch (closeErr) {
              console.warn(
                "Failed to close vocab socket after backend error:",
                closeErr,
              );
            }
            resetForRetry(payload.error);
            return;
          }
          if (payload?.type === "transcript") {
            console.log("Vocab transcript event:", payload);
            if (typeof payload.text === "string" && payload.text.length > 0) {
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
            awaitingServerCloseRef.current = false;
            const feedbackKey = payload.feedback_key;
            const isSuccess = feedbackKey === "success_clear";
            const shouldCountAttempt = feedbackKey !== "retry_audio";
            setIsGrading(false);
            setMessage("");
            const attemptText =
              typeof payload?.transcript === "string"
                ? payload.transcript
                : lastTranscriptRef.current;
            const nextAttempts = shouldCountAttempt
              ? [...attempts, { text: attemptText, correct: isSuccess }]
              : attempts;
            const hasReachedMax =
              !isSuccess &&
              shouldCountAttempt &&
              nextAttempts.length >= MAX_ATTEMPTS;
            setFeedbackKey(hasReachedMax ? "definition" : feedbackKey);
            if (shouldCountAttempt) {
              setAttempts(nextAttempts);
            }
            if (isSuccess && !isCorrectSolved) {
              setIsCorrectSolved(true);
              setWordResults((prev) => {
                const next = [...prev];
                next[currentWordIndex] = "correct";
                return next;
              });
            } else if (hasReachedMax) {
              setWordResults((prev) => {
                const next = [...prev];
                next[currentWordIndex] = "wrong";
                return next;
              });
            }
            setPhase("feedback");
            stopRecording(false);
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
        console.warn(`[Vocab ${sessionId}] ws error`);
        awaitingServerCloseRef.current = false;
        stopAfterRecorderFlushRef.current = false;
        wsReadyRef.current = false;
        startMessageSentRef.current = false;
        clearRecordingCountdown();
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
        resetForRetry("Audio connection failed. Try again.");
      };

      ws.onclose = () => {
        console.log(`[Vocab ${sessionId}] socket closed`);
        clearWsStatusInterval();
        wsReadyRef.current = false;
        startMessageSentRef.current = false;
        clearRecordingCountdown();
        if (wsRef.current === ws) {
          wsRef.current = null;
          const waitingForServer = awaitingServerCloseRef.current;
          awaitingServerCloseRef.current = false;
          resetForRetry("Audio stream closed. Tap the mic to try again.");
          if (waitingForServer) {
            return;
          }
          return;
        }
        awaitingServerCloseRef.current = false;
        stopMicCapture();
      };

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.onstart = () => {
        console.log(`[Vocab ${sessionId}] recorder started`, mimeType);
        clearRecordingCountdown();
        setIsRecording(true);
      };

      recorder.onstop = () => {
        console.log(`[Vocab ${sessionId}] recorder stopped`);
        setIsRecording(false);

        if (
          stopAfterRecorderFlushRef.current &&
          wsRef.current === ws &&
          ws.readyState === WebSocket.OPEN
        ) {
          stopAfterRecorderFlushRef.current = false;
          setIsGrading(true);
          setPhase("grading");
          console.log(
            `[Vocab ${sessionId}] sending close after recorder flush`,
          );
          ws.send("close");
          return;
        }

        stopAfterRecorderFlushRef.current = false;
      };

      recorder.ondataavailable = async (event) => {
        if (
          !wsRef.current ||
          wsRef.current !== ws ||
          ws.readyState !== WebSocket.OPEN
        ) {
          console.warn(
            `[Vocab ${sessionId}] dropping chunk before socket ready`,
            event.data?.size ?? 0,
          );
          return;
        }
        if (!startMessageSentRef.current || !wsReadyRef.current) {
          console.warn(
            `[Vocab ${sessionId}] dropping chunk before start handshake completed`,
            event.data?.size ?? 0,
          );
          return;
        }
        if (!event.data || event.data.size <= 0) {
          return;
        }

        ws.send(event.data);
        sentChunkCountRef.current += 1;

        if (!firstChunkLoggedRef.current) {
          firstChunkLoggedRef.current = true;
          const hexPreview = await blobToHexPreview(event.data, 8);
          const hasWebmHeader = hexPreview
            .toLowerCase()
            .startsWith("1a 45 df a3");
          console.log(
            `[Vocab ${sessionId}] first chunk`,
            "bytes",
            event.data.size,
            "hex",
            hexPreview,
          );
          if (!hasWebmHeader) {
            console.warn(
              `[Vocab ${sessionId}] first chunk does not start with WebM EBML header`,
              hexPreview,
            );
          }
        } else {
          console.log(`[Vocab ${sessionId}] chunk`, "bytes", event.data.size);
        }
      };

      console.log(
        `[Vocab ${sessionId}] recorder armed; waiting for socket open`,
      );
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
    setDefinition(items[nextIndex]?.definition ?? "");
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
  const hasFailedMax = !isCorrectSolved && attempts.length >= MAX_ATTEMPTS;
  const canRetry = !isCorrectSolved && attempts.length < MAX_ATTEMPTS;
  const isDefinitionVisible = (isCorrectSolved || hasFailedMax) && definition;
  const displayContextText = isDefinitionVisible ? definition : contextText;
  const quoteStart = isDefinitionVisible ? "" : "“";
  const quoteEnd = isDefinitionVisible ? "" : "”";
  const showNextButton =
    phase === "feedback" && (isCorrectSolved || hasFailedMax) && !isLastWord;
  const showMicButton =
    phase === "revealed" ||
    phase === "recording" ||
    (phase === "feedback" && canRetry);
  const showRetryHint =
    showMicButton && phase === "feedback" && !isCorrectSolved && !hasFailedMax;
  const isRecorderArming = phase === "recording" && !isRecording && !isGrading;
  const showGradingIndicator = isGrading && phase === "grading";
  const promptText = (() => {
    if (phase === "feedback") {
      if (isCorrectSolved) return "Well done, ready for the next word?";
      if (hasFailedMax) return "Let's move on to the next word.";
      return `What is the meaning of “${rawTargetWord}”?`;
    }
    return `What is the meaning of “${rawTargetWord}”?`;
  })();
  const showCompletionScreen =
    isVocabularyCompletionPreview ||
    (phase === "feedback" && isLastWord && isCorrectSolved);
  const completionCorrectCount = isVocabularyCompletionPreview
    ? 1
    : correctCount;
  const completionItemCount = isVocabularyCompletionPreview ? 1 : items.length;

  if (isSpellingPreview || showSpellingGame) {
    return (
      <VisualSpellingGame
        onComplete={onComplete}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        previewMode={
          isSpellingPreview
            ? (previewMode as Extract<
                typeof previewMode,
                "spelling-intro" | "spelling-game" | "spelling-complete"
              >)
            : null
        }
      />
    );
  }

  if (showIntro) {
    return (
      <PreGameScreen
        title="Nice Listening!"
        description="You heard some intersting words. Let's slow down and understand them together"
        subtitle="Next: Word meaning"
        buttonLabel="Understand the words"
        onStart={() => setShowIntro(false)}
        backgroundImage={vocabularyBackground}
        lightBackground
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white text-[#020617]">
        <span className="text-sm uppercase tracking-super text-[#020617]/60">
          Loading vocab...
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-white text-[#020617]">
        <span className="text-sm uppercase tracking-super text-[#020617]/60">
          {loadError}
        </span>
      </div>
    );
  }

  if (!targetWord) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-white text-[#020617]">
        <span className="text-sm uppercase tracking-super text-[#020617]/60">
          No vocab words available.
        </span>
      </div>
    );
  }

  if (showCompletionScreen) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-white px-6 py-10 text-center text-[#020617]">
        <div className="flex max-w-2xl flex-col items-center gap-5">
          <div className="text-xs font-semibold uppercase tracking-super text-[#020617]/60">
            Vocabulary Complete
          </div>
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            Nice work. You got the word right.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#020617]/60 md:text-2xl">
            Next up: spelling the word you just learned.
          </p>
          <div className="text-sm uppercase tracking-super text-brand-primary md:text-base">
            Score: {completionCorrectCount} / {completionItemCount}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSpellingGame(true)}
          className="rounded-full bg-brand-primary px-8 py-4 text-lg font-bold uppercase tracking-wider text-[#2a2629] shadow-elevated shadow-inset-highlight transition hover:brightness-[1.03] active:scale-[0.97] md:px-10 md:py-5 md:text-xl"
        >
          Move On To Spelling
        </button>
      </div>
    );
  }

  return (
    <div className="visual-vocabulary-game relative flex min-h-screen w-full flex-col items-center gap-3 bg-white px-4 py-4 text-[#020617] sm:gap-4 sm:px-6 sm:py-6">
      <div className="visual-vocabulary-game__progress relative flex w-full max-w-3xl items-center gap-3">
        <span className="visual-vocabulary-game__progress-label text-[0.6rem] font-semibold tracking-super text-[#020617]/60 sm:text-xs md:text-xl">
          WORDS
        </span>
        <div className="visual-vocabulary-game__progress-track relative flex-1">
          <div className="visual-vocabulary-game__progress-line absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-black/10 md:h-1.5" />
          <div className="visual-vocabulary-game__progress-steps relative flex w-full items-center justify-between gap-2 py-2 md:py-4">
            {items.map((_, index) => {
              const isActive = index === currentWordIndex;
              const result = wordResults[index];
              const dotColor =
                result === "correct"
                  ? "bg-[#8fb29a]"
                  : result === "wrong"
                    ? "bg-[#d2a84f]"
                    : "bg-black/20";
              return (
                <div
                  key={`vocab-step-${index}`}
                  className="relative flex flex-shrink-0 items-center justify-center"
                >
                  {isActive ? (
                    <img src={tomoIcon} alt="" className="visual-vocabulary-game__progress-icon h-6 w-auto md:h-10" />
                  ) : (
                    <span
                      className={`visual-vocabulary-game__progress-dot h-2 w-2 rounded-full md:h-4 md:w-4 ${dotColor}`}
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
            className={`flex h-16 items-center justify-center rounded-full bg-brand-primary px-10 text-xl font-semibold uppercase tracking-wide text-[#2a2629] shadow-elevated shadow-inset-highlight transition sm:h-18 sm:text-2xl md:h-20 md:text-3xl ${
              isPlaying
                ? "cursor-not-allowed opacity-70"
                : "hover:brightness-[1.03] active:scale-[0.97]"
            }`}
          >
            Listen
          </button>
        </div>
      )}

      <div
        className={`visual-vocabulary-game__sentence-wrap flex w-full max-w-3xl flex-col items-center gap-5 text-center sm:gap-6 ${
          phase === "listen" ? "pointer-events-none" : "mt-10 sm:mt-12"
        }`}
      >
        <div className="visual-vocabulary-game__sentence-group flex w-full flex-col items-center gap-3 md:gap-4">
          <div className="visual-vocabulary-game__sentence-row flex w-full items-center justify-center">
            <div className="visual-vocabulary-game__sentence inline-flex flex-wrap items-center justify-center gap-3 text-3xl font-bold text-[#020617] md:text-5xl">
              <span className="inline">
                {phase === "listen" ? (
                  <span className="opacity-0">“{contextText}”</span>
                ) : (
                  <>
                    {(() => {
                      if (!rawTargetWord) {
                        return `${quoteStart}${displayContextText}${quoteEnd}`;
                      }
                      const lowerText = displayContextText.toLowerCase();
                      const lowerTarget = rawTargetWord.toLowerCase();
                      const matchIndex = lowerText.indexOf(lowerTarget);
                      if (matchIndex === -1) {
                        return `${quoteStart}${displayContextText}${quoteEnd}`;
                      }
                      const beforeText = displayContextText.slice(
                        0,
                        matchIndex,
                      );
                      const matchText = displayContextText.slice(
                        matchIndex,
                        matchIndex + rawTargetWord.length,
                      );
                      const afterText = displayContextText.slice(
                        matchIndex + rawTargetWord.length,
                      );
                      const punctuationMatch = afterText.match(/^[,.;:!?)\]]+/);
                      const trailingPunctuation = punctuationMatch
                        ? punctuationMatch[0]
                        : "";
                      const afterRest = afterText.slice(
                        trailingPunctuation.length,
                      );
                      return (
                        <>
                          <span>{`${quoteStart}${beforeText}`}</span>
                          <span className="text-[#C59A41]">
                            {matchText}
                            {trailingPunctuation ? (
                              <span className="text-[#020617]">
                                {trailingPunctuation}
                              </span>
                            ) : null}
                          </span>
                          <span>{`${afterRest}${quoteEnd}`}</span>
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
                  className={`visual-vocabulary-game__replay flex h-10 w-10 items-center justify-center text-[#020617]/70 transition sm:h-12 sm:w-12 md:h-16 md:w-16 ${
                    isPlaying
                      ? "cursor-not-allowed opacity-70"
                      : "hover:brightness-[1.03]"
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
        <div className="visual-vocabulary-game__prompt absolute inset-x-0 top-1/2 z-20 mx-auto flex w-full max-w-3xl -translate-y-1/2 flex-col items-center gap-4 px-4 text-center">
          <div className="visual-vocabulary-game__prompt-text text-3xl font-semibold text-[#020617]/60 md:text-4xl">
            {promptText}
          </div>
          <div className="visual-vocabulary-game__mic-wrap flex h-28 w-28 items-center justify-center md:h-32 md:w-32">
            {showGradingIndicator ? (
              <div
                className="relative flex h-full w-full items-center justify-center rounded-full bg-[#020617]/[0.05] text-[#020617] ring-2 ring-black/10"
                aria-label="Grading your answer"
              >
                <svg
                  viewBox="0 0 64 64"
                  className="h-16 w-16 text-[#020617]/75 md:h-20 md:w-20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <g className="origin-center animate-spin">
                    <circle cx="24" cy="24" r="8" />
                    <path d="M24 10v4" />
                    <path d="M24 34v4" />
                    <path d="M10 24h4" />
                    <path d="M34 24h4" />
                    <path d="m14.1 14.1 2.8 2.8" />
                    <path d="m31.1 31.1 2.8 2.8" />
                    <path d="m14.1 33.9 2.8-2.8" />
                    <path d="m31.1 16.9 2.8-2.8" />
                  </g>
                  <g
                    className="slow-spin"
                    style={{ transformOrigin: "41px 41px", animationDuration: "1.9s" }}
                  >
                    <circle cx="41" cy="41" r="6.5" />
                    <path d="M41 30v3.5" />
                    <path d="M41 48.5V52" />
                    <path d="M30 41h3.5" />
                    <path d="M48.5 41H52" />
                    <path d="m33.2 33.2 2.4 2.4" />
                    <path d="m46.4 46.4 2.4 2.4" />
                    <path d="m33.2 48.8 2.4-2.4" />
                    <path d="m46.4 35.6 2.4-2.4" />
                  </g>
                </svg>
                <span className="absolute -bottom-8 text-xs font-bold uppercase tracking-[0.24em] text-[#020617]/55 md:-bottom-10 md:text-sm">
                  Grading
                </span>
              </div>
            ) : showNextButton ? (
              <button
                type="button"
                onClick={handleNextWord}
                className="flex h-full w-full items-center justify-center rounded-full bg-black/[0.04] text-[#020617] ring-2 ring-black/10 transition"
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
            ) : showMicButton ? (
              <button
                type="button"
                onClick={
                  isRecording ? () => stopRecording(true, true) : startRecording
                }
                className={`relative flex h-full w-full flex-shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-[#020617] ring-2 transition ${
                  isRecording
                    ? "mic-pulse bg-[#ff7b92]/16 text-[#b42346] ring-[#ff7b92]/45"
                    : isRecorderArming
                      ? "bg-brand-primary/18 text-[#7c5200] ring-brand-primary/35"
                      : "ring-black/10 hover:brightness-[1.03]"
                }`}
                aria-label={
                  isRecording
                    ? "Stop recording"
                    : isRecorderArming
                      ? "Preparing microphone"
                      : "Start recording"
                }
                disabled={isRecorderArming}
              >
                {isRecording ? (
                  <>
                    <span className="absolute inset-0 rounded-full border border-[#ff7b92]/50 animate-ping" />
                    <span className="absolute inset-[6px] rounded-full border border-[#ff7b92]/35" />
                  </>
                ) : isRecorderArming ? (
                  <>
                    <span className="absolute inset-0 rounded-full border border-brand-primary/40 animate-pulse" />
                    <span className="absolute inset-[8px] rounded-full border border-brand-primary/25" />
                  </>
                ) : null}
                {isRecording ? (
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
                    <svg
                      viewBox="0 0 16 16"
                      className="h-14 w-14 md:h-16 md:w-16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="10" height="10" rx="1" />
                    </svg>
                  </div>
                ) : isRecorderArming ? (
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
                    {typeof armingCountdown === "number" ? (
                      <span className="font-display text-4xl font-bold tabular-nums md:text-5xl">
                        {armingCountdown}
                      </span>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-14 w-14 animate-pulse md:h-16 md:w-16"
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
                  </div>
                ) : (
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
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
                  </div>
                )}
              </button>
            ) : null}
          </div>
          <div className="visual-vocabulary-game__retry mt-3 min-h-[3.5rem] text-center text-2xl font-semibold text-[#020617]/60 md:text-3xl">
            <span className={showRetryHint ? "opacity-100" : "opacity-0"}>
              Let's try again!
            </span>
          </div>
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

      <div className="visual-vocabulary-game__coach w-full max-w-2xl">
        <div className="visual-vocabulary-game__coach-row flex items-end gap-3">
          <img
            src={tomoSpellingIcon}
            alt=""
            className="visual-vocabulary-game__coach-icon h-20 w-auto sm:h-24 md:h-32"
          />
          <div className="relative flex-1">
            <span className="absolute bottom-6 left-[-6px] h-3 w-3 rotate-45 bg-[#EFE6DA]" />
            <div className="visual-vocabulary-game__coach-bubble flex w-full items-center justify-between gap-3 rounded-2xl bg-[#EFE6DA] px-4 py-3 text-lg font-semibold tracking-[0.08em] text-[#020617] ring-1 ring-black/[0.08] sm:text-xl md:text-3xl">
              <span
                className="visual-vocabulary-game__coach-text flex-1 break-words whitespace-pre-line"
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
    </div>
  );
};

export default VisualVocabularyGame;
