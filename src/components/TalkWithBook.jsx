import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  usePipecatClient,
  usePipecatClientMediaTrack,
  usePipecatClientMicControl,
} from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import BookTitle from "./layout/BookTitle.jsx";
import AnimationManager from "./layout/AnimationManager";
import VocabularyPanel from "./features/modality/VocabularyPanel";
import SpellingPanel from "./features/modality/SpellingPanel";
import BotAudio from "./audio/BotAudio";
import listenBackground from "../assets/img/discussion/listen.png";
import talkBackground from "../assets/img/discussion/talk.png";
import {
  useVoiceBot,
  VoiceBotStatus,
} from "../context/VoiceBotContextProvider.jsx";
import { isMobile } from "react-device-detect";

import { usePipecatConnection } from "../hooks/usePipecatConnection";
import { useConversations } from "../hooks/useConversations";
import { useAnalytics } from "../hooks/useAnalytics";
import { supabase } from "../hooks/integrations/supabase/client";
import { useDotProgress } from "../hooks/useDotProgress";

export const TalkWithBook = ({
  botConfig,
  onNavigate,
  selectedBook,
  chapter,
  currentCharacter,
  userName = "",
  studentId = null,
  region = "",
  showControlButton = false,
  onDisconnectRequest,
  connectionManagedExternally = false,
  onRequestSessionStart,
}) => {
  const client = usePipecatClient();
  const logsRef = useRef(null);

  const startedHereRef = useRef(false);
  const startedChatRef = useRef(false);
  const userMutedRef = useRef(false);
  const micEnabledRef = useRef(false);
  const hadConversationRef = useRef(false);
  const hasSubmittedSummaryRef = useRef(false);
  const introAudioRef = useRef(null);
  const introMetaRef = useRef(null);
  const introStateRef = useRef({
    metadataReceived: false,
    statusReceived: false,
  });
  const introActiveRef = useRef(false);
  const introOfferRequestedRef = useRef(false);
  const introStartedSentRef = useRef(false);
  const introDurationRef = useRef(null);
  const introAudioUrlRef = useRef(null);
  const pendingIntroInterruptRef = useRef(null);
  const pendingIntroCompletedRef = useRef(null);
  const botReadyRef = useRef(false);
  const languageSentRef = useRef(false);
  const isDisconnectingRef = useRef(false);
  const introAutoplayBlockedRef = useRef(false);
  const sessionPhaseRef = useRef("intro_loading");
  const introHandlersRef = useRef({
    complete: null,
    interrupt: null,
    maybeRequestOfferStart: null,
    maybeCompleteOnDuration: null,
  });
  const listeningCompletedRef = useRef(false);
  const micControlOverrideRef = useRef(null);
  const talkingStartRef = useRef(null);
  const talkingElapsedRef = useRef(0);
  const listeningElapsedRef = useRef(0);
  const listeningSyncRef = useRef({ time: 0, position: 0 });
  const listeningSyncCallbackRef = useRef(null);
  const lastListeningStatusRef = useRef(null);
  const lastTalkingStatusRef = useRef(null);

  const [isMicActive, setIsMicActive] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [serverEvent, setServerEvent] = useState(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [conversationReady, setConversationReady] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [sessionPhase, setSessionPhase] = useState("intro_loading");
  const [isMicEnabledUi, setIsMicEnabledUi] = useState(false);
  const [isBotReady, setIsBotReady] = useState(false);
  const [introRemainingSeconds, setIntroRemainingSeconds] = useState(null);
  const [introCurrentSeconds, setIntroCurrentSeconds] = useState(null);
  const [introDurationSeconds, setIntroDurationSeconds] = useState(null);
  const [listeningStatus, setListeningStatus] = useState(null);
  const [talkingStatus, setTalkingStatus] = useState(null);
  const [sessionEndingReason, setSessionEndingReason] = useState(null);

  const {
    addVoicebotMessage,
    setConversationConfig,
    setLatestServerEvent,
    startListening,
    startSpeaking,
    startThinking,
    status,
  } = useVoiceBot();

  const { enableMic } = usePipecatClientMicControl();
  const { getConversations } = useConversations();
  const { wakeAnalytics, callAnalyzeConversation } = useAnalytics();
  const { upsertDotProgress, getDotProgress } = useDotProgress();

  // 🎤 Tracks
  const localAudioTrack = usePipecatClientMediaTrack("audio", "local");
  const botAudioTrack = usePipecatClientMediaTrack("audio", "bot");

  // 🔹 Helper to create analyser safely with proper cleanup
  const createAnalyser = useCallback((track) => {
    if (!track) return null;
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      const src = ctx.createMediaStreamSource(new MediaStream([track]));
      src.connect(analyser);
      return { analyser, ctx, src };
    } catch (err) {
      console.error("Failed to create analyser:", err);
      return null;
    }
  }, []);

  // Analysers - recreate when tracks change
  const userVoiceAnalyser = useMemo(
    () => createAnalyser(localAudioTrack),
    [localAudioTrack, createAnalyser],
  );
  const agentVoiceAnalyser = useMemo(
    () => createAnalyser(botAudioTrack),
    [botAudioTrack, createAnalyser],
  );

  // Cleanup audio contexts to avoid leaks - FIXED
  useEffect(() => {
    return () => {
      if (userVoiceAnalyser?.ctx?.state !== "closed") {
        userVoiceAnalyser?.src?.disconnect();
        userVoiceAnalyser?.ctx
          ?.close()
          .catch((e) => console.warn("Error closing user audio context:", e));
      }
    };
  }, [userVoiceAnalyser]);

  useEffect(() => {
    return () => {
      if (agentVoiceAnalyser?.ctx?.state !== "closed") {
        agentVoiceAnalyser?.src?.disconnect();
        agentVoiceAnalyser?.ctx
          ?.close()
          .catch((e) => console.warn("Error closing agent audio context:", e));
      }
    };
  }, [agentVoiceAnalyser]);

  // Connection hook
  const { connect, disconnect, sendClientMessage, isConnected, isConnecting } =
    usePipecatConnection();

  // Persist session metadata
  const characterModalities = useMemo(() => {
    if (currentCharacter?.modalities) {
      return currentCharacter.modalities;
    }
    if (currentCharacter?.modality) {
      return currentCharacter.modality;
    }
    return "";
  }, [currentCharacter]);

  useEffect(() => {
    if (studentId && selectedBook?.id) {
      setConversationConfig({
        studentId,
        bookId: selectedBook.id,
        autoSave: true,
        modalities: characterModalities || null,
      });
    }
  }, [studentId, selectedBook?.id, setConversationConfig, characterModalities]);

  useEffect(() => {
    setLatestServerEvent(serverEvent ?? null);
  }, [serverEvent, setLatestServerEvent]);

  const addLog = (msg) => {
    if (logsRef.current) {
      logsRef.current.textContent += `\n${msg}`;
    }
  };

  const formatRemaining = useCallback((seconds) => {
    if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
      return "00:00";
    }
    const clamped = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, []);

  const setPhase = useCallback((nextPhase) => {
    sessionPhaseRef.current = nextPhase;
    setSessionPhase(nextPhase);
    introActiveRef.current =
      nextPhase === "intro_playing" || nextPhase === "intro_paused";
    if (nextPhase !== "intro_playing") {
      setIsIntroPlaying(false);
    }
    if (
      nextPhase !== "intro_playing" &&
      nextPhase !== "intro_paused" &&
      nextPhase !== "intro_done" &&
      nextPhase !== "chat_active" &&
      nextPhase !== "chat_paused"
    ) {
      setIntroRemainingSeconds(null);
      setIntroCurrentSeconds(null);
      setIntroDurationSeconds(null);
    }
  }, []);

  const isIntroInteractive =
    sessionPhase === "intro_playing" || sessionPhase === "intro_paused";
  const isIntroActive = isIntroInteractive || sessionPhase === "intro_loading";
  const showIntroPlayer = true;
  const showIntroControls =
    isIntroInteractive ||
    sessionPhase === "intro_done" ||
    sessionPhase === "chat_active" ||
    sessionPhase === "chat_paused";
  const audioControlsDisabled =
    sessionPhase !== "intro_playing" &&
    sessionPhase !== "intro_paused" &&
    sessionPhase !== "chat_paused";
  const disableStop = audioControlsDisabled || !isIntroInteractive;

  const getEpisodeNumber = useCallback(() => {
    const numeric =
      typeof chapter === "number" ? chapter : parseInt(chapter ?? "0", 10);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return numeric;
  }, [chapter]);

  const updateDotProgressSafe = useCallback(
    (payload) => {
      if (!studentId || !selectedBook?.id) return;
      const episode = getEpisodeNumber();
      if (!episode) return;
      upsertDotProgress({
        studentId,
        bookId: selectedBook.id,
        episode,
        ...payload,
      });
    },
    [studentId, selectedBook?.id, getEpisodeNumber, upsertDotProgress],
  );

  const setListeningStatusSafe = useCallback((status) => {
    if (typeof status === "string") {
      setListeningStatus(status);
    }
  }, []);

  const setTalkingStatusSafe = useCallback((status) => {
    if (typeof status === "string") {
      setTalkingStatus(status);
    }
  }, []);

  const updateListeningProgress = useCallback(
    (status, positionOverride) => {
      const audio = introAudioRef.current;
      const position =
        typeof positionOverride === "number"
          ? positionOverride
          : (audio?.currentTime ?? 0);
      const nextElapsed = Math.max(
        listeningElapsedRef.current,
        Math.floor(position),
      );
      listeningElapsedRef.current = nextElapsed;
      listeningSyncRef.current = { time: Date.now(), position: nextElapsed };
      if (lastListeningStatusRef.current === status) {
        updateDotProgressSafe({
          elapsedListeningSeconds: nextElapsed,
        });
        return;
      }
      lastListeningStatusRef.current = status;
      setListeningStatusSafe(status);
      updateDotProgressSafe({
        listeningStatus: status,
        elapsedListeningSeconds: nextElapsed,
      });
    },
    [updateDotProgressSafe, setListeningStatusSafe],
  );

  const maybeSyncListeningElapsed = useCallback(
    (position) => {
      const phase = sessionPhaseRef.current;
      if (phase !== "intro_playing" && phase !== "intro_paused") {
        return;
      }
      const nextElapsed = Math.max(
        listeningElapsedRef.current,
        Math.floor(position),
      );
      if (nextElapsed <= 0) return;
      const now = Date.now();
      const lastSync = listeningSyncRef.current;
      const positionDelta = nextElapsed - (lastSync?.position ?? 0);
      const timeDelta = now - (lastSync?.time ?? 0);
      if (positionDelta < 5 && timeDelta < 5000) {
        return;
      }
      listeningElapsedRef.current = nextElapsed;
      listeningSyncRef.current = { time: now, position: nextElapsed };
      updateDotProgressSafe({
        elapsedListeningSeconds: nextElapsed,
      });
    },
    [updateDotProgressSafe],
  );

  useEffect(() => {
    listeningSyncCallbackRef.current = maybeSyncListeningElapsed;
  }, [maybeSyncListeningElapsed]);

  const getResumePosition = useCallback((durationValue) => {
    const elapsed = listeningElapsedRef.current;
    if (!Number.isFinite(elapsed) || elapsed <= 0) return 0;
    let resumePosition = Math.max(elapsed - 2, 0);
    if (typeof durationValue === "number" && durationValue > 0) {
      const maxStart = Math.max(durationValue - 0.5, 0);
      resumePosition = Math.min(resumePosition, maxStart);
    }
    return resumePosition;
  }, []);

  const applyResumePosition = useCallback(
    (durationValue) => {
      const audio = introAudioRef.current;
      if (!audio) return;
      const duration =
        typeof durationValue === "number"
          ? durationValue
          : typeof introDurationRef.current === "number"
            ? introDurationRef.current
            : audio.duration || null;
      const resumePosition = getResumePosition(duration);
      if (Math.abs((audio.currentTime ?? 0) - resumePosition) < 0.25) {
        return;
      }
      audio.currentTime = resumePosition;
      setIntroCurrentSeconds(resumePosition);
      if (typeof duration === "number" && duration > 0) {
        setIntroRemainingSeconds(
          Math.ceil(Math.max(0, duration - resumePosition)),
        );
      }
      updateListeningProgress("paused", resumePosition);
    },
    [getResumePosition, updateListeningProgress],
  );

  const startTalkingTimer = useCallback(() => {
    if (talkingStartRef.current) return;
    talkingStartRef.current = Date.now();
  }, []);

  const flushTalkingElapsed = useCallback(
    (nextStatus) => {
      if (talkingStartRef.current) {
        const deltaSeconds = Math.floor(
          (Date.now() - talkingStartRef.current) / 1000,
        );
        if (deltaSeconds > 0) {
          talkingElapsedRef.current += deltaSeconds;
        }
        talkingStartRef.current = null;
      }
      if (nextStatus && lastTalkingStatusRef.current !== nextStatus) {
        lastTalkingStatusRef.current = nextStatus;
        setTalkingStatusSafe(nextStatus);
      }
      updateDotProgressSafe({
        talkingStatus: nextStatus,
        elapsedTalkingSeconds: talkingElapsedRef.current,
      });
    },
    [updateDotProgressSafe, setTalkingStatusSafe],
  );

  const markTalkingStatus = useCallback(
    (nextStatus) => {
      if (lastTalkingStatusRef.current === nextStatus) {
        updateDotProgressSafe({
          elapsedTalkingSeconds: talkingElapsedRef.current,
        });
        return;
      }
      lastTalkingStatusRef.current = nextStatus;
      setTalkingStatusSafe(nextStatus);
      updateDotProgressSafe({
        talkingStatus: nextStatus,
        elapsedTalkingSeconds: talkingElapsedRef.current,
      });
    },
    [updateDotProgressSafe, setTalkingStatusSafe],
  );

  // 🔹 Unified mic sync helper
  const syncMic = useCallback(
    (enabled = true, options = {}) => {
      const { force = false } = options;
      if (!force && enabled && userMutedRef.current) {
        return;
      }

      if (!force && enabled && micEnabledRef.current === enabled) {
        return;
      }

      const override = micControlOverrideRef.current;
      const hasOverride =
        override &&
        ((enabled && override.action === "resumeListening") ||
          (!enabled && override.action === "pauseListening"));
      const overridePayload = hasOverride ? override?.payload : null;

      try {
        enableMic(enabled);
        micEnabledRef.current = enabled;
        setIsMicEnabledUi(enabled);
        if (enabled) {
          if (isConnected) {
            const payload = {
              action: "resumeListening",
              ...(overridePayload ?? {}),
            };
            sendClientMessage("control", payload);
            startListening();
          }
        } else {
          if (isConnected) {
            const payload = {
              action: "pauseListening",
              ...(overridePayload ?? {}),
            };
            sendClientMessage("control", payload);
          }
        }
        if (hasOverride && isConnected) {
          micControlOverrideRef.current = null;
        }
      } catch (e) {
        console.error("❌ Mic sync failed", e);
      }
    },
    [enableMic, sendClientMessage, startListening, isConnected],
  );

  // Wrap connect/disconnect to mark ownership
  const connectHere = useCallback(async () => {
    startedHereRef.current = true;
    isDisconnectingRef.current = false;
    introAutoplayBlockedRef.current = false;
    setSessionEndingReason(null);
    await connect({
      botConfig,
      userName,
      studentId,
      selectedBook,
      chapter,
      region,
    });
  }, [connect, botConfig, userName, studentId, selectedBook, chapter, region]);

  const stopIntroAudio = useCallback(
    ({ unload = false, resetTime = true } = {}) => {
      const audio = introAudioRef.current;
      if (!audio) return;
      try {
        audio.pause();
        if (resetTime) {
          audio.currentTime = 0;
        }
        if (unload) {
          audio.removeAttribute("src");
          audio.src = "";
          audio.load();
        }
      } catch (err) {
        console.warn("Failed to stop intro audio:", err);
      }
    },
    [],
  );

  const disconnectHere = useCallback(async () => {
    isDisconnectingRef.current = true;
    introAutoplayBlockedRef.current = true;
    setPhase("disconnecting");
    if (introActiveRef.current) {
      updateListeningProgress("paused");
    }
    stopIntroAudio({ unload: true });

    // Disable mic first
    try {
      enableMic(false);
    } catch (e) {
      console.warn("Failed to disable mic:", e);
    }
    micEnabledRef.current = false;
    userMutedRef.current = false;
    setIsMicEnabledUi(false);

    startedHereRef.current = false;
    startedChatRef.current = false; // Reset chat started flag
    setIsBotReady(false);
    setConversationReady(false);

    await disconnect();
    isDisconnectingRef.current = false;
  }, [
    disconnect,
    enableMic,
    stopIntroAudio,
    setPhase,
    updateListeningProgress,
  ]);

  const sendIntroControl = useCallback(
    (action, payload = {}) => {
      sendClientMessage("control", { action, ...payload });
    },
    [sendClientMessage],
  );

  const getIntroMeta = useCallback(() => {
    const meta = introMetaRef.current;
    if (!meta || typeof meta !== "object") return {};
    return meta;
  }, []);

  const sendSetLanguage = useCallback(() => {
    if (languageSentRef.current) return;
    sendClientMessage("set-language", { language: "en-US" });
    languageSentRef.current = true;
  }, [sendClientMessage]);

  const sendIntroStarted = useCallback(
    (positionOverride) => {
      if (introStartedSentRef.current) return;
      const meta = getIntroMeta();
      const audio = introAudioRef.current;
      const position =
        typeof positionOverride === "number"
          ? positionOverride
          : (audio?.currentTime ?? 0);
      const audioUrl =
        introAudioUrlRef.current ||
        meta.audio_url ||
        meta.audioUrl ||
        meta.url ||
        meta.audio;

      sendIntroControl("introStarted", {
        circle_id: meta.circle_id ?? meta.circleId,
        audio_url: audioUrl,
        format: meta.format,
        position_s: position,
      });
      introStartedSentRef.current = true;
    },
    [getIntroMeta, sendIntroControl],
  );

  const maybeStartChat = useCallback(() => {
    if (startedChatRef.current) return;
    if (!botReadyRef.current) return;
    if (!isConnected) return;
    if (sessionPhaseRef.current !== "intro_done") return;
    if (!conversationReady) return;
    if (pendingIntroInterruptRef.current !== null) return;
    if (pendingIntroCompletedRef.current !== null) return;
    if (!selectedBook?.id) return;
    try {
      sendClientMessage("start-chat", {
        book_id: selectedBook.id,
        chapter: chapter ?? "",
        chapter_old: String(botConfig?.metadata?.book?.progress) ?? "",
      });
      startedChatRef.current = true;
      hadConversationRef.current = true;
      setPhase(userMutedRef.current ? "chat_paused" : "chat_active");
      addLog("✅ start-chat sent");
    } catch (error) {
      console.error("Error sending start messages:", error);
    }
  }, [
    addLog,
    botConfig?.metadata?.book?.progress,
    chapter,
    isConnected,
    selectedBook?.id,
    sendClientMessage,
    conversationReady,
    setPhase,
  ]);

  const requestOfferStart = useCallback(
    (positionOverride) => {
      if (introOfferRequestedRef.current) return;
      introOfferRequestedRef.current = true;
      if (
        connectionManagedExternally &&
        typeof onRequestSessionStart === "function"
      ) {
        onRequestSessionStart();
      } else if (!isConnected && !isConnecting) {
        connectHere().catch((err) => {
          console.error("Failed to start session:", err);
        });
      } else if (isConnected) {
        if (
          !introStateRef.current.metadataReceived ||
          !introActiveRef.current
        ) {
          return;
        }
        sendIntroStarted(positionOverride);
      }
    },
    [
      connectHere,
      isConnected,
      isConnecting,
      sendIntroStarted,
      connectionManagedExternally,
      onRequestSessionStart,
    ],
  );

  const maybeRequestOfferStart = useCallback(
    (positionOverride) => {
      const duration =
        typeof introDurationRef.current === "number"
          ? introDurationRef.current
          : null;
      if (!duration || duration <= 0) return;
      const audio = introAudioRef.current;
      const currentTime =
        typeof positionOverride === "number"
          ? positionOverride
          : (audio?.currentTime ?? 0);
      const remaining = duration - currentTime;
      if (remaining <= 30) {
        requestOfferStart(currentTime);
      }
    },
    [requestOfferStart],
  );

  const resetIntroState = useCallback(() => {
    introStateRef.current = {
      metadataReceived: false,
      statusReceived: false,
    };
    introMetaRef.current = null;
    introActiveRef.current = false;
    introOfferRequestedRef.current = false;
    introStartedSentRef.current = false;
    introDurationRef.current = null;
    introAudioUrlRef.current = null;
    pendingIntroInterruptRef.current = null;
    pendingIntroCompletedRef.current = null;
    botReadyRef.current = false;
    languageSentRef.current = false;
    micControlOverrideRef.current = null;
    listeningCompletedRef.current = false;
    setIsBotReady(false);
    setIntroRemainingSeconds(null);
    setIntroCurrentSeconds(null);
    setIntroDurationSeconds(null);
    setPhase("intro_loading");
  }, [setPhase]);

  const parseServerPayload = useCallback((payload) => {
    if (!payload) return null;
    if (typeof payload === "string") {
      try {
        return JSON.parse(payload);
      } catch (err) {
        return null;
      }
    }
    if (typeof payload === "object") return payload;
    return null;
  }, []);

  const extractIntroMetadata = useCallback((payload) => {
    if (!payload || typeof payload !== "object") return null;
    const type = payload.event_type || payload.eventType;
    if (type === "intro_metadata") {
      return payload;
    }
    if (payload.data) {
      return extractIntroMetadata(payload.data);
    }
    return null;
  }, []);

  const extractIntroStatus = useCallback((payload) => {
    if (!payload || typeof payload !== "object") return null;
    const type = payload.event_type || payload.eventType;
    if (type === "intro_status") {
      return payload;
    }
    if (payload.data) {
      return extractIntroStatus(payload.data);
    }
    return null;
  }, []);

  const extractSessionEnding = useCallback((payload) => {
    if (!payload || typeof payload !== "object") return null;
    if (payload.type === "session-ending") {
      return payload;
    }
    if (payload.data) {
      return extractSessionEnding(payload.data);
    }
    return null;
  }, []);

  const interruptIntroPlayback = useCallback(
    (positionOverride) => {
      if (!introActiveRef.current) return;
      introAutoplayBlockedRef.current = true;
      setPhase("intro_done");
      const meta = getIntroMeta();
      const audio = introAudioRef.current;
      const position =
        typeof positionOverride === "number"
          ? positionOverride
          : (audio?.currentTime ?? 0);
      const durationValue =
        typeof introDurationRef.current === "number"
          ? introDurationRef.current
          : audio?.duration ||
            meta.duration ||
            meta.durationSeconds ||
            position;
      const completedPosition =
        typeof durationValue === "number" ? durationValue : position;
      if (typeof durationValue === "number") {
        setIntroDurationSeconds(durationValue);
      }
      setIntroCurrentSeconds(completedPosition);
      setIntroRemainingSeconds(0);
      if (audio && typeof durationValue === "number") {
        try {
          audio.currentTime = durationValue;
        } catch (err) {
          console.warn("Failed to move intro audio to end:", err);
        }
      }
      updateListeningProgress("completed", completedPosition);
      if (!isConnected) {
        pendingIntroInterruptRef.current = position;
        requestOfferStart(position);
      } else {
        sendIntroControl("introInterrupted", {
          circle_id: meta.circle_id ?? meta.circleId,
          position_s: position,
        });
        maybeStartChat();
      }
      stopIntroAudio({ resetTime: false });
    },
    [
      getIntroMeta,
      sendIntroControl,
      stopIntroAudio,
      isConnected,
      requestOfferStart,
      maybeStartChat,
      setPhase,
      updateListeningProgress,
    ],
  );

  const completeIntroPlayback = useCallback(() => {
    if (!introActiveRef.current) return;
    introAutoplayBlockedRef.current = true;
    setPhase("intro_done");
    const meta = getIntroMeta();
    const audio = introAudioRef.current;
    const overrideDuration = introDurationRef.current;
    const duration =
      (Number.isFinite(overrideDuration) && overrideDuration > 0
        ? overrideDuration
        : null) ||
      audio?.duration ||
      meta.duration ||
      meta.durationSeconds ||
      0;
    if (typeof duration === "number") {
      setIntroDurationSeconds(duration);
    }
    setIntroCurrentSeconds(duration);
    setIntroRemainingSeconds(0);
    if (audio && typeof duration === "number") {
      try {
        audio.currentTime = duration;
      } catch (err) {
        console.warn("Failed to move intro audio to end:", err);
      }
    }
    updateListeningProgress("completed", duration);
    if (!isConnected) {
      pendingIntroCompletedRef.current = duration;
      requestOfferStart(audio?.currentTime ?? 0);
    } else {
      sendIntroControl("introCompleted", {
        circle_id: meta.circle_id ?? meta.circleId,
        duration: duration,
      });
      maybeStartChat();
    }
    stopIntroAudio({ resetTime: false });
  }, [
    getIntroMeta,
    sendIntroControl,
    isConnected,
    requestOfferStart,
    maybeStartChat,
    stopIntroAudio,
    setPhase,
    updateListeningProgress,
  ]);

  const maybeCompleteOnDuration = useCallback(
    (positionOverride) => {
      if (!introActiveRef.current) return false;
      const duration =
        typeof introDurationRef.current === "number"
          ? introDurationRef.current
          : null;
      if (!duration || duration <= 0) return false;
      const position =
        typeof positionOverride === "number"
          ? positionOverride
          : (introAudioRef.current?.currentTime ?? 0);
      if (position < duration) return false;
      stopIntroAudio();
      completeIntroPlayback();
      return true;
    },
    [completeIntroPlayback, stopIntroAudio],
  );

  useEffect(() => {
    introHandlersRef.current.complete = completeIntroPlayback;
    introHandlersRef.current.interrupt = interruptIntroPlayback;
    introHandlersRef.current.maybeRequestOfferStart = maybeRequestOfferStart;
    introHandlersRef.current.maybeCompleteOnDuration = maybeCompleteOnDuration;
  }, [
    completeIntroPlayback,
    interruptIntroPlayback,
    maybeRequestOfferStart,
    maybeCompleteOnDuration,
  ]);

  const handleIntroMetadata = useCallback(
    (metadata) => {
      if (!metadata || typeof metadata !== "object") return;
      if (isDisconnectingRef.current) return;
      if (introAutoplayBlockedRef.current) return;
      if (introStateRef.current.metadataReceived) {
        return;
      }
      const audioUrl =
        metadata.audio_url ||
        metadata.audioUrl ||
        metadata.url ||
        metadata.audio;
      const rawDuration = Number(metadata.duration);
      const duration = Number.isFinite(rawDuration) ? rawDuration : null;
      introMetaRef.current = metadata;
      introAudioUrlRef.current = audioUrl ?? null;
      introDurationRef.current = duration;
      introStateRef.current.metadataReceived = true;
      const resumePosition = getResumePosition(duration);
      if (listeningCompletedRef.current) {
        const completedDuration =
          typeof duration === "number"
            ? duration
            : listeningElapsedRef.current || resumePosition;
        if (typeof completedDuration === "number") {
          setIntroDurationSeconds(completedDuration);
          setIntroCurrentSeconds(completedDuration);
          setIntroRemainingSeconds(0);
        }
        setPhase("intro_done");
        if (pendingIntroCompletedRef.current === null) {
          pendingIntroCompletedRef.current =
            typeof completedDuration === "number" ? completedDuration : 0;
        }
        requestOfferStart(0);
        return;
      }
      setPhase("intro_playing");
      setConversationReady(false);
      syncMic(false, { force: true });
      updateListeningProgress("paused", resumePosition);
      if (duration !== null) {
        const remaining = Math.max(0, duration - resumePosition);
        setIntroRemainingSeconds(Math.ceil(remaining));
      }
      setIntroCurrentSeconds(resumePosition);
      setIntroDurationSeconds(duration ?? null);

      if (!audioUrl) {
        interruptIntroPlayback(0);
        return;
      }

      const audio = introAudioRef.current;
      if (!audio) {
        interruptIntroPlayback(0);
        return;
      }

      audio.src = audioUrl;
      audio.currentTime = resumePosition;
      audio.load();
      if (duration !== null) {
        const remaining = Math.max(0, duration - resumePosition);
        if (remaining <= 30) {
          requestOfferStart(resumePosition);
        }
      }
      audio
        .play()
        .then(() => {
          setIsIntroPlaying(true);
        })
        .catch((err) => {
          const message = err?.message || "";
          const name = err?.name || "";
          const isAbort =
            name === "AbortError" ||
            message.includes("interrupted by a call to pause");
          const isAutoplayBlocked = name === "NotAllowedError";
          if (isAbort || isAutoplayBlocked) {
            console.warn("Intro playback did not start:", err);
            setPhase("intro_paused");
            updateListeningProgress("paused");
            return;
          }
          console.warn("Intro playback failed:", err);
          interruptIntroPlayback(0);
        });
    },
    [
      interruptIntroPlayback,
      requestOfferStart,
      syncMic,
      setPhase,
      updateListeningProgress,
      getResumePosition,
    ],
  );

  const handleIntroStatus = useCallback(
    (statusPayload) => {
      if (!statusPayload || typeof statusPayload !== "object") return;
      introStateRef.current.statusReceived = true;
      if (
        statusPayload.status === "playing" ||
        statusPayload.status === "started"
      ) {
        syncMic(false, { force: true });
      }
      if (
        statusPayload.conversation_ready === false ||
        statusPayload.conversation_ready === "false"
      ) {
        setConversationReady(false);
      }
      if (
        statusPayload.conversation_ready === true ||
        statusPayload.conversation_ready === "true"
      ) {
        setConversationReady(true);
      }
    },
    [syncMic],
  );

  const handleIntroSeek = useCallback((event) => {
    const audio = introAudioRef.current;
    if (!audio) return;
    const rawValue = Number(event.target.value);
    if (!Number.isFinite(rawValue)) return;
    const duration =
      typeof introDurationRef.current === "number"
        ? introDurationRef.current
        : audio.duration || null;
    const clamped =
      typeof duration === "number"
        ? Math.min(duration, Math.max(0, rawValue))
        : Math.max(0, rawValue);
    audio.currentTime = clamped;
    setIntroCurrentSeconds(clamped);
    if (typeof duration === "number") {
      setIntroRemainingSeconds(Math.max(0, Math.ceil(duration - clamped)));
    }
  }, []);

  const toggleIntroPlayback = useCallback(() => {
    const audio = introAudioRef.current;
    if (!audio) return;
    const phase = sessionPhaseRef.current;
    const isIntroPhase =
      phase === "intro_playing" ||
      phase === "intro_paused" ||
      phase === "intro_loading";
    if (!isIntroPlaying) {
      const meta = getIntroMeta();
      const audioUrl =
        introAudioUrlRef.current ||
        meta.audio_url ||
        meta.audioUrl ||
        meta.url ||
        meta.audio;
      if (!audioUrl) return;
      const currentSrc = (audio.src || "").trim();
      const isMissingSrc = !currentSrc || currentSrc === window.location.href;
      const isDifferentSrc = !isMissingSrc && !currentSrc.includes(audioUrl);
      if (isMissingSrc || isDifferentSrc) {
        audio.src = audioUrl;
        audio.load();
      }
      const duration =
        typeof introDurationRef.current === "number"
          ? introDurationRef.current
          : audio.duration || null;
      const isAtEnd =
        audio.ended ||
        (typeof duration === "number" &&
          duration > 0 &&
          audio.currentTime >= duration - 0.1);
      if (isAtEnd) {
        audio.currentTime = 0;
        setIntroCurrentSeconds(0);
        if (typeof duration === "number" && duration > 0) {
          setIntroRemainingSeconds(Math.ceil(duration));
        }
      }
      audio.play().catch((err) => {
        const message = err?.message || "";
        const name = err?.name || "";
        const isAbort =
          name === "AbortError" ||
          message.includes("interrupted by a call to pause");
        const isAutoplayBlocked = name === "NotAllowedError";
        if (isAbort || isAutoplayBlocked) {
          setPhase("intro_paused");
          return;
        }
        console.warn("Failed to resume intro audio:", err);
      });
      if (isIntroPhase) {
        setPhase("intro_playing");
        updateListeningProgress("paused");
      }
    } else {
      audio.pause();
      if (isIntroPhase) {
        setPhase("intro_paused");
        updateListeningProgress("paused");
      }
    }
  }, [getIntroMeta, isIntroPlaying, setPhase, updateListeningProgress]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    introAudioRef.current = audio;

    const handleEnded = () => {
      if (!introActiveRef.current) {
        setIsIntroPlaying(false);
        const duration =
          typeof introDurationRef.current === "number"
            ? introDurationRef.current
            : audio.duration || null;
        if (typeof duration === "number") {
          setIntroCurrentSeconds(duration);
          setIntroRemainingSeconds(0);
        }
        return;
      }
      introHandlersRef.current.complete?.();
    };
    const handleError = () => {
      if (!introActiveRef.current) {
        return;
      }
      introHandlersRef.current.interrupt?.(0);
    };
    const handlePlay = () => {
      setIsIntroPlaying(true);
    };
    const handlePause = () => {
      setIsIntroPlaying(false);
    };
    const handleLoadedMetadata = () => {
      if (
        !introDurationRef.current ||
        !Number.isFinite(introDurationRef.current)
      ) {
        introDurationRef.current = audio.duration || null;
      }
      if (typeof introDurationRef.current === "number") {
        setIntroDurationSeconds((prev) =>
          typeof prev === "number" ? prev : introDurationRef.current,
        );
      }
    };
    const handleTimeUpdate = () => {
      const isActiveIntro = introActiveRef.current;
      const position = audio.currentTime ?? 0;
      if (isActiveIntro) {
        const didComplete =
          introHandlersRef.current.maybeCompleteOnDuration?.(position) ?? false;
        if (didComplete) return;
      }
      const duration =
        typeof introDurationRef.current === "number"
          ? introDurationRef.current
          : null;
      if (duration) {
        const remaining = Math.max(0, Math.ceil(duration - position));
        setIntroRemainingSeconds((prev) =>
          prev === remaining ? prev : remaining,
        );
        const current = Math.min(duration, Math.max(0, position));
        setIntroCurrentSeconds((prev) => (prev === current ? prev : current));
      }
      if (isActiveIntro) {
        introHandlersRef.current.maybeRequestOfferStart?.(position);
        listeningSyncCallbackRef.current?.(position);
      }
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      stopIntroAudio({ unload: true });
      introAudioRef.current = null;
    };
  }, [stopIntroAudio]);

  useEffect(() => {
    if (
      sessionPhase === "intro_loading" ||
      sessionPhase === "intro_playing" ||
      sessionPhase === "intro_paused" ||
      sessionPhase === "disconnecting"
    ) {
      syncMic(false, { force: true });
      return;
    }
    if (sessionPhase === "chat_active") {
      syncMic(true, { force: true });
      return;
    }
    if (sessionPhase === "chat_paused") {
      syncMic(false, { force: true });
    }
  }, [sessionPhase, syncMic]);

  useEffect(() => {
    if (!startedChatRef.current) return;
    if (isCelebrating) {
      flushTalkingElapsed("completed");
      return;
    }
    if (sessionPhase === "chat_active") {
      startTalkingTimer();
      markTalkingStatus("in_progress");
      return;
    }
    if (sessionPhase === "chat_paused") {
      flushTalkingElapsed("paused");
      return;
    }
    if (sessionPhase === "disconnecting") {
      flushTalkingElapsed(isCelebrating ? "completed" : "paused");
    }
  }, [
    sessionPhase,
    isCelebrating,
    startTalkingTimer,
    markTalkingStatus,
    flushTalkingElapsed,
  ]);

  useEffect(() => {
    if (!isConnected) return;
    if (!introOfferRequestedRef.current) return;
    if (introStartedSentRef.current) return;
    if (!introStateRef.current.metadataReceived) return;
    if (!introActiveRef.current) return;
    sendIntroStarted();
  }, [isConnected, sendIntroStarted]);

  useEffect(() => {
    if (sessionPhase === "intro_done" && conversationReady && isBotReady) {
      maybeStartChat();
    }
  }, [sessionPhase, conversationReady, isBotReady, maybeStartChat]);

  useEffect(() => {
    if (sessionPhase !== "intro_done") return;
    if (!conversationReady || !isBotReady || !isConnected) return;
    if (startedChatRef.current) return;
    const timeoutId = setTimeout(() => {
      if (
        sessionPhaseRef.current === "intro_done" &&
        conversationReady &&
        botReadyRef.current &&
        isConnected &&
        !startedChatRef.current
      ) {
        console.warn("⚠️ Chat did not start after intro; retrying start-chat.");
        maybeStartChat();
      }
    }, 1200);
    return () => clearTimeout(timeoutId);
  }, [
    sessionPhase,
    conversationReady,
    isBotReady,
    isConnected,
    maybeStartChat,
  ]);

  useEffect(() => {
    if (!isConnected) return;
    if (pendingIntroInterruptRef.current === null) return;
    const meta = getIntroMeta();
    const position = pendingIntroInterruptRef.current;
    pendingIntroInterruptRef.current = null;
    sendIntroControl("introInterrupted", {
      circle_id: meta.circle_id ?? meta.circleId,
      position_s: position,
    });
    maybeStartChat();
  }, [getIntroMeta, isConnected, sendIntroControl, maybeStartChat]);

  useEffect(() => {
    if (!isConnected) return;
    if (pendingIntroCompletedRef.current === null) return;
    const meta = getIntroMeta();
    const duration = pendingIntroCompletedRef.current;
    pendingIntroCompletedRef.current = null;
    sendIntroControl("introCompleted", {
      circle_id: meta.circle_id ?? meta.circleId,
      duration: duration,
    });
    maybeStartChat();
  }, [getIntroMeta, isConnected, sendIntroControl, maybeStartChat]);

  useEffect(() => {
    hasSubmittedSummaryRef.current = false;
    hadConversationRef.current = false;
    talkingStartRef.current = null;
    talkingElapsedRef.current = 0;
    listeningElapsedRef.current = 0;
    listeningSyncRef.current = { time: 0, position: 0 };
    lastListeningStatusRef.current = null;
    lastTalkingStatusRef.current = null;
    resetIntroState();
    setConversationReady(false);
    userMutedRef.current = false;
    micEnabledRef.current = false;
    setIsMicEnabledUi(false);
    stopIntroAudio({ unload: true });
  }, [selectedBook?.id, chapter, resetIntroState, stopIntroAudio]);

  useEffect(() => {
    let isCancelled = false;
    const loadIntroMetadata = async () => {
      if (!selectedBook?.id) return;
      if (introAutoplayBlockedRef.current) return;
      const rawEpisode = Number(chapter);
      const episode = Number.isFinite(rawEpisode) ? rawEpisode : null;
      if (episode === null) return;
      if (isDisconnectingRef.current) return;
      if (introStateRef.current.metadataReceived) return;
      try {
        const { data, error } = await supabase
          .from("circles_dots")
          .select("audio, duration, circle_id")
          .eq("circle_id", selectedBook.id)
          .eq("episode", episode)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (
          isCancelled ||
          introStateRef.current.metadataReceived ||
          isDisconnectingRef.current ||
          introAutoplayBlockedRef.current
        ) {
          return;
        }
        if (error) {
          console.warn("Failed to load intro audio metadata:", error);
        }
        handleIntroMetadata({
          circle_id: data?.circle_id ?? selectedBook.id,
          audio_url: data?.audio ?? null,
          duration: data?.duration ?? null,
        });
      } catch (err) {
        if (
          isCancelled ||
          introStateRef.current.metadataReceived ||
          isDisconnectingRef.current ||
          introAutoplayBlockedRef.current
        ) {
          return;
        }
        console.warn("Failed to load intro audio metadata:", err);
        handleIntroMetadata({
          circle_id: selectedBook.id,
          audio_url: null,
          duration: null,
        });
      }
    };

    loadIntroMetadata();

    return () => {
      isCancelled = true;
    };
  }, [handleIntroMetadata, selectedBook?.id, chapter]);

  useEffect(() => {
    if (!studentId || !selectedBook?.id) return;
    const episode = getEpisodeNumber();
    if (!episode) return;
    let cancelled = false;

    const loadDotProgress = async () => {
      const { data } = await getDotProgress(
        studentId,
        selectedBook.id,
        episode,
      );
      if (cancelled) return;
      if (data) {
        const listeningElapsed = Number(data.elapsed_listening_seconds);
        if (Number.isFinite(listeningElapsed) && listeningElapsed > 0) {
          listeningElapsedRef.current = listeningElapsed;
        }
        const talkingElapsed = Number(data.elapsed_talking_seconds);
        if (Number.isFinite(talkingElapsed) && talkingElapsed > 0) {
          talkingElapsedRef.current = talkingElapsed;
        }
        if (typeof data.listening_status === "string") {
          lastListeningStatusRef.current = data.listening_status;
          setListeningStatusSafe(data.listening_status);
          if (data.listening_status === "completed") {
            listeningCompletedRef.current = true;
            if (introStateRef.current.metadataReceived) {
              const audio = introAudioRef.current;
              const duration =
                typeof introDurationRef.current === "number"
                  ? introDurationRef.current
                  : audio?.duration || listeningElapsedRef.current || 0;
              if (typeof duration === "number") {
                setIntroDurationSeconds(duration);
                setIntroCurrentSeconds(duration);
                setIntroRemainingSeconds(0);
              }
              setPhase("intro_done");
              if (pendingIntroCompletedRef.current === null) {
                pendingIntroCompletedRef.current = duration;
              }
              stopIntroAudio({ resetTime: false });
              requestOfferStart(0);
              return;
            }
          }
        }
        if (typeof data.talking_status === "string") {
          lastTalkingStatusRef.current = data.talking_status;
          setTalkingStatusSafe(data.talking_status);
        }
      }
      if (introStateRef.current.metadataReceived) {
        applyResumePosition();
      }
    };

    loadDotProgress();

    return () => {
      cancelled = true;
    };
  }, [
    studentId,
    selectedBook?.id,
    getEpisodeNumber,
    getDotProgress,
    applyResumePosition,
    requestOfferStart,
    stopIntroAudio,
    setPhase,
  ]);

  useEffect(() => {
    const introMetadata =
      botConfig?.metadata?.intro_metadata ?? botConfig?.metadata?.introMetadata;
    if (!introMetadata || introStateRef.current.metadataReceived) {
      return;
    }
    if (introAutoplayBlockedRef.current) {
      return;
    }
    handleIntroMetadata(introMetadata);
  }, [
    botConfig?.metadata?.intro_metadata,
    botConfig?.metadata?.introMetadata,
    handleIntroMetadata,
  ]);

  const handleMicToggle = useCallback(
    (nextEnabled) => {
      if (sessionPhaseRef.current === "disconnecting") {
        return;
      }
      if (isIntroActive) {
        return;
      }
      const audio = introAudioRef.current;
      if (audio && !audio.paused && !audio.ended) {
        try {
          audio.pause();
        } catch (err) {
          console.warn("Failed to pause intro audio:", err);
        }
      }
      micControlOverrideRef.current = nextEnabled
        ? { action: "resumeListening", payload: {} }
        : {
            action: "pauseListening",
            payload: {
              reason: "user_pause",
              max_pause_s: 300,
            },
          };
      userMutedRef.current = !nextEnabled;
      if (nextEnabled) {
        setPhase("chat_active");
      } else {
        setPhase("chat_paused");
      }
    },
    [isIntroActive, isIntroPlaying, setPhase, toggleIntroPlayback],
  );

  // Reset refs when component mounts
  useEffect(() => {
    startedChatRef.current = false;
    introAutoplayBlockedRef.current = false;
    return () => {
      startedChatRef.current = false;
    };
  }, []);

  // Allow parent to trigger disconnect
  useEffect(() => {
    if (!onDisconnectRequest) return;
    onDisconnectRequest.current = disconnectHere;
    return () => {
      onDisconnectRequest.current = null;
    };
  }, [onDisconnectRequest, disconnectHere]);

  // ✅ Guard for required checks
  const hasRequiredData = !!(
    botConfig &&
    selectedBook?.id &&
    chapter &&
    currentCharacter
  );

  // ---- Pipecat event bindings ----
  useEffect(() => {
    if (!client) return;

    const onConnected = () => {
      addLog("✅ Connected to Pipecat bot");
      startedChatRef.current = false;
    };

    const onDisconnected = () => {
      addLog("❌ Disconnected");
      isDisconnectingRef.current = false;
      enableMic(false);
      micEnabledRef.current = false;
      userMutedRef.current = false;
      setIsMicEnabledUi(false);
      setIsBotReady(false);
      setIsBotThinking(false);
      setConversationReady(false);
      if (startedChatRef.current || talkingElapsedRef.current > 0) {
        flushTalkingElapsed(isCelebrating ? "completed" : "paused");
      }
      startedChatRef.current = false;
      resetIntroState();
      stopIntroAudio({ unload: true });
    };

    const onBotReady = () => {
      addLog("🤖 Bot ready!");
      botReadyRef.current = true;
      setIsBotReady(true);

      if (startedChatRef.current) {
        return;
      }

      // Wait a bit for connection to fully stabilize before sending messages
      setTimeout(() => {
        if (!isConnected) {
          console.warn("⚠️ Bot ready but not connected yet");
          return;
        }
        wakeAnalytics();
        sendSetLanguage();
      }, 200);
    };

    const onUserStartedSpeaking = () => {
      setIsMicActive(true);
    };

    const onUserStoppedSpeaking = () => {
      setIsMicActive(false);
    };

    const onBotStartedSpeaking = () => {
      setIsBotSpeaking(true);
      setIsBotThinking(false);
      startSpeaking();
    };
    const onBotStoppedSpeaking = () => setIsBotSpeaking(false);
    const onBotLlmStarted = () => {
      setIsBotThinking(true);
      startThinking();
    };
    const onBotLlmStopped = () => {
      setIsBotThinking(false);
      if (!isBotSpeaking && sessionPhaseRef.current === "chat_active") {
        startListening();
      }
    };

    const onUserTranscript = (data) => {
      if (data.final) {
        addVoicebotMessage({ user: data.text });
        if (sessionPhaseRef.current === "chat_active") {
          startListening();
        }
      }
    };
    const onBotOutput = (data) => {
      if (!data?.text) return;
      addVoicebotMessage({ assistant: data.text });
    };

    const onServerMessage = (msg) => {
      // Keep the server message visible in the UI via serverEvent only.
      const parsed = parseServerPayload(msg);
      const introMetadata = extractIntroMetadata(parsed);
      if (introMetadata) {
        handleIntroMetadata(introMetadata);
        return;
      }
      const introStatus = extractIntroStatus(parsed);
      if (introStatus) {
        handleIntroStatus(introStatus);
        return;
      }
      const sessionEnding = extractSessionEnding(parsed);
      if (sessionEnding) {
        const reason =
          typeof sessionEnding.reason === "string"
            ? sessionEnding.reason
            : "unknown";
        addLog(`🛑 Session ending: ${reason}`);
        setSessionEndingReason(reason);
        disconnectHere();
        return;
      }
      setServerEvent(msg);
    };

    client.on(RTVIEvent.Connected, onConnected);
    client.on(RTVIEvent.Disconnected, onDisconnected);
    client.on(RTVIEvent.BotReady, onBotReady);
    client.on(RTVIEvent.UserStartedSpeaking, onUserStartedSpeaking);
    client.on(RTVIEvent.UserStoppedSpeaking, onUserStoppedSpeaking);
    client.on(RTVIEvent.BotStartedSpeaking, onBotStartedSpeaking);
    client.on(RTVIEvent.BotStoppedSpeaking, onBotStoppedSpeaking);
    client.on(RTVIEvent.BotLlmStarted, onBotLlmStarted);
    client.on(RTVIEvent.BotLlmStopped, onBotLlmStopped);
    client.on(RTVIEvent.UserTranscript, onUserTranscript);
    client.on(RTVIEvent.BotOutput, onBotOutput);
    client.on(RTVIEvent.ServerMessage, onServerMessage);

    return () => {
      client.off(RTVIEvent.Connected, onConnected);
      client.off(RTVIEvent.Disconnected, onDisconnected);
      client.off(RTVIEvent.BotReady, onBotReady);
      client.off(RTVIEvent.UserStartedSpeaking, onUserStartedSpeaking);
      client.off(RTVIEvent.UserStoppedSpeaking, onUserStoppedSpeaking);
      client.off(RTVIEvent.BotStartedSpeaking, onBotStartedSpeaking);
      client.off(RTVIEvent.BotStoppedSpeaking, onBotStoppedSpeaking);
      client.off(RTVIEvent.BotLlmStarted, onBotLlmStarted);
      client.off(RTVIEvent.BotLlmStopped, onBotLlmStopped);
      client.off(RTVIEvent.UserTranscript, onUserTranscript);
      client.off(RTVIEvent.BotOutput, onBotOutput);
      client.off(RTVIEvent.ServerMessage, onServerMessage);
    };
  }, [
    client,
    enableMic,
    addVoicebotMessage,
    startListening,
    startSpeaking,
    startThinking,
    parseServerPayload,
    extractIntroMetadata,
    extractIntroStatus,
    extractSessionEnding,
    handleIntroMetadata,
    handleIntroStatus,
    disconnectHere,
    resetIntroState,
    stopIntroAudio,
    isBotSpeaking,
    flushTalkingElapsed,
    isCelebrating,
    wakeAnalytics,
    sendSetLanguage,
  ]);

  // --- Auto-connect when button is hidden ---
  useEffect(() => {
    if (
      connectionManagedExternally ||
      showControlButton ||
      isConnected ||
      isConnecting ||
      !hasRequiredData
    ) {
      return;
    }

    if (!introOfferRequestedRef.current) {
      return;
    }

    // Check if client is already connecting
    const clientState = client?.state;
    if (clientState === "ready" || clientState === "connecting") {
      return;
    }

    connectHere().catch((err) => {
      // Don't log if it's just a "already started" error
      if (!err.message?.includes("already started")) {
        console.error("Auto-connect failed", err);
      }
    });
  }, [
    showControlButton,
    isConnected,
    isConnecting,
    hasRequiredData,
    connectHere,
    client,
    connectionManagedExternally,
  ]);

  // --- No BotReady fallbacks or safety mic toggles ---

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (startedHereRef.current) {
        disconnectHere();
      }
    };
  }, [disconnectHere]);

  const modalityKey = useMemo(() => {
    const raw =
      currentCharacter?.modalities?.toLowerCase?.() ??
      currentCharacter?.modality?.toLowerCase?.() ??
      "";
    return raw;
  }, [currentCharacter]);

  const eventMeta = useMemo(() => {
    if (!serverEvent) {
      return { eventType: "", gameType: "" };
    }

    const normalizeKeys = (payload) => {
      if (!payload || typeof payload !== "object") {
        return { eventType: "", gameType: "" };
      }

      const rawEventType =
        typeof payload.event_type === "string"
          ? payload.event_type
          : typeof payload.eventType === "string"
            ? payload.eventType
            : "";
      const rawGameType =
        typeof payload.game_type === "string"
          ? payload.game_type
          : typeof payload.gameType === "string"
            ? payload.gameType
            : "";

      if (rawEventType || rawGameType) {
        return { eventType: rawEventType, gameType: rawGameType };
      }

      if (payload.data) {
        return normalizeKeys(payload.data);
      }

      return { eventType: "", gameType: "" };
    };

    let parsed = serverEvent;
    if (typeof serverEvent === "string") {
      try {
        parsed = JSON.parse(serverEvent);
      } catch {
        return { eventType: "", gameType: "" };
      }
    }

    if (!parsed || typeof parsed !== "object") {
      return { eventType: "", gameType: "" };
    }

    const { eventType, gameType } = normalizeKeys(parsed);
    return {
      eventType: (eventType || "").toLowerCase(),
      gameType: (gameType || "").toLowerCase(),
    };
  }, [serverEvent]);

  const panelKey = useMemo(() => {
    if (eventMeta.gameType) {
      return eventMeta.gameType;
    }
    return modalityKey;
  }, [eventMeta.gameType, modalityKey]);

  const renderedServerContent = useMemo(() => {
    if (sessionEndingReason) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 py-5 text-center text-white">
          <span className="text-2xl font-semibold">Session ended</span>
          <span className="text-sm text-white/70">
            {sessionEndingReason}
          </span>
        </div>
      );
    }

    if (isCelebrating) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-6 py-5 text-center text-white">
          <span className="text-4xl font-extrabold tracking-wide">
            Well done on your mission
          </span>
        </div>
      );
    }

    if (panelKey.includes("vocab")) {
      return <VocabularyPanel event={serverEvent} isWaiting={!serverEvent} />;
    }

    if (panelKey.includes("spell")) {
      return <SpellingPanel event={serverEvent} isWaiting={!serverEvent} />;
    }

    if (!serverEvent) {
      return <div className="h-full w-full" />;
    }

    const ALLOWED_EVENT_TYPES = new Set([
      "celebration_sent",
      "game_complete",
      "question_starting",
      "answer_received",
    ]);

    if (!ALLOWED_EVENT_TYPES.has(eventMeta.eventType)) {
      return <div className="h-full w-full" />;
    }

    return (
      <div className="h-full w-full overflow-auto px-6 py-5">
        <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-white/80">
          {typeof serverEvent === "string"
            ? serverEvent
            : JSON.stringify(serverEvent, null, 2)}
        </pre>
      </div>
    );
  }, [panelKey, serverEvent, eventMeta.eventType, isCelebrating, sessionEndingReason]);

  const characterAccent = currentCharacter?.customBg ?? "";
  const characterBgClass = currentCharacter?.bg ?? "";
  const isListenMode =
    sessionPhase === "intro_loading" ||
    sessionPhase === "intro_playing" ||
    sessionPhase === "intro_paused";
  const backgroundImage = isListenMode ? listenBackground : talkBackground;
  const [backgroundHeight, setBackgroundHeight] = useState(null);
  const backgroundRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    const img = new Image();

    const updateHeight = () => {
      if (!backgroundRef.current || !img.naturalWidth) {
        return;
      }
      const width = backgroundRef.current.clientWidth;
      const containerHeight = backgroundRef.current.clientHeight;
      const ratio = img.naturalHeight / img.naturalWidth;
      const height = Math.min(containerHeight, width * ratio);

      if (isActive) {
        setBackgroundHeight(height);
      }
    };

    img.onload = updateHeight;
    img.src = backgroundImage;

    if (img.complete) {
      updateHeight();
    }

    window.addEventListener("resize", updateHeight);
    return () => {
      isActive = false;
      window.removeEventListener("resize", updateHeight);
    };
  }, [backgroundImage]);

  const talkBackgroundStyle = useMemo(() => {
    return {
      backgroundColor: "#000",
      backgroundImage: `url(${backgroundImage})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% auto",
      backgroundPosition: "top center",
    };
  }, [backgroundImage]);

  const thinkingCharacterName =
    currentCharacter?.name?.trim() && currentCharacter.name.trim().length > 0
      ? currentCharacter.name.trim()
      : "Tomo";
  const showThinkingBadge =
    isBotThinking &&
    thinkingCharacterName.toLowerCase() !== "wordie" &&
    thinkingCharacterName.length > 0;
  const thinkingLabel = `${thinkingCharacterName} is thinking...`;

  useEffect(() => {
    if (eventMeta.eventType === "celebration_sent") {
      setIsCelebrating(true);
    }
  }, [eventMeta.eventType]);

  useEffect(() => {
    if (
      isConnected ||
      hasSubmittedSummaryRef.current ||
      !hadConversationRef.current ||
      !studentId ||
      !selectedBook?.id
    ) {
      return;
    }

    let cancelled = false;
    let retryTimeout;

    const runAnalytics = async () => {
      try {
        const { data } = await getConversations(studentId, selectedBook.id);
        const latestConversation = (data || [])[0];

        if (!latestConversation?.id) {
          if (!cancelled) {
            retryTimeout = window.setTimeout(runAnalytics, 2000);
          }
          return;
        }

        const normalizedChapterStart =
          typeof botConfig?.metadata?.book?.progress === "number"
            ? botConfig.metadata.book.progress
            : parseInt(
                botConfig?.metadata?.book?.progress ?? `${chapter ?? 0}`,
                10,
              ) || 0;
        const normalizedChapterEnd =
          typeof chapter === "number"
            ? chapter
            : parseInt(chapter ?? "0", 10) || normalizedChapterStart;

        await callAnalyzeConversation({
          conversationId: latestConversation.id,
          bookId: latestConversation.book_id,
          chapterStart: normalizedChapterStart,
          chapterEnd: normalizedChapterEnd,
          saveResults: true,
        });

        hasSubmittedSummaryRef.current = true;
      } catch (err) {
        console.error("Failed to analyze conversation:", err);
        if (!cancelled) {
          retryTimeout = window.setTimeout(runAnalytics, 5000);
        }
      }
    };

    runAnalytics();

    return () => {
      cancelled = true;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [
    isConnected,
    studentId,
    selectedBook?.id,
    chapter,
    getConversations,
    botConfig?.metadata?.book?.progress,
  ]);

  const introDurationValue =
    typeof introDurationSeconds === "number" ? introDurationSeconds : 0;
  const introCurrentValue =
    typeof introCurrentSeconds === "number" ? introCurrentSeconds : 0;
  const introSliderValue =
    introDurationValue > 0
      ? Math.min(introCurrentValue, introDurationValue)
      : Math.max(0, introCurrentValue);
  const introPlayedLabel = formatRemaining(introCurrentValue);
  const introRemainingLabel = formatRemaining(
    typeof introRemainingSeconds === "number"
      ? introRemainingSeconds
      : Math.max(0, introDurationValue - introCurrentValue),
  );
  const introRemainingNegativeLabel = `-${introRemainingLabel}`;
  const introProgressPercent =
    introDurationValue > 0
      ? Math.min(
          100,
          Math.max(0, (introSliderValue / introDurationValue) * 100),
        )
      : 0;
  const resolvedListeningStatus = (
    listeningStatus ?? lastListeningStatusRef.current ?? ""
  ).toLowerCase();
  const resolvedTalkingStatus = (
    talkingStatus ?? lastTalkingStatusRef.current ?? "not_started"
  ).toLowerCase();
  const shouldShowMic =
    resolvedListeningStatus === "completed" &&
    resolvedTalkingStatus !== "completed" &&
    !sessionEndingReason;
  const gradientHeight = backgroundHeight
    ? Math.max(0, backgroundHeight * 0.2)
    : null;
  const gradientTop = backgroundHeight
    ? Math.max(0, backgroundHeight - gradientHeight)
    : null;
  const isBotAudioMuted =
    sessionPhase === "intro_loading" ||
    sessionPhase === "intro_playing" ||
    sessionPhase === "intro_paused" ||
    sessionPhase === "disconnecting";

  return (
    <div
      className={`inset-0 flex min-h-screen flex-col overflow-hidden transition-colors duration-500 ${characterBgClass} bg-black text-white`}
      style={talkBackgroundStyle}
      ref={backgroundRef}
    >
      <div
        className="absolute inset-x-0 top-0 bg-gradient-to-t from-black to-transparent pointer-events-none"
        style={{
          top: gradientTop ? `${gradientTop}px` : "44vh",
          height: gradientHeight ? `${gradientHeight}px` : "11vh",
        }}
      />
      <div className="flex-none">
        <BookTitle
          book={selectedBook}
          chapter={chapter}
          onBack={() => {
            disconnectHere();
            onNavigate?.("circle");
          }}
          isDark
        />
      </div>

      <div className="flex-1 px-6 pt-4 overflow-hidden text-white">
        <div className="h-full w-full">{renderedServerContent}</div>
      </div>

      <div
        ref={logsRef}
        className="absolute top-0 right-0 text-xs p-2 mt-4 whitespace-pre-line"
      />

      <BotAudio volume={1} playbackRate={1} muted={isBotAudioMuted} />
      <div className="absolute inset-x-0 bottom-28 flex flex-col items-center gap-3 px-4">
        {shouldShowMic && (
          <div className="flex justify-center">
            <AnimationManager
              agentVoiceAnalyser={agentVoiceAnalyser?.analyser || null}
              userVoiceAnalyser={userVoiceAnalyser?.analyser || null}
              isUserSpeaking={isMicActive}
              isBotSpeaking={isBotSpeaking}
              isMicEnabled={isMicEnabledUi}
              characterImages={currentCharacter?.images}
              characterName={currentCharacter?.name}
              onMicToggle={handleMicToggle}
              isCelebrating={isCelebrating}
              forceAwake={isIntroActive}
              isMicToggleDisabled={isIntroActive}
              useMicOrb
            />
          </div>
        )}
        {showIntroPlayer && (
          <div
            className={`flex w-full max-w-md flex-col gap-2 transition-opacity ${
              audioControlsDisabled ? "opacity-40" : "opacity-100"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-white">
              <span>{introPlayedLabel}</span>
              <span>{introRemainingNegativeLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              {showIntroControls && (
                <button
                  type="button"
                  onClick={toggleIntroPlayback}
                  aria-label={isIntroPlaying ? "Pause intro" : "Play intro"}
                  className="p-1 text-white disabled:opacity-40"
                  disabled={audioControlsDisabled}
                >
                  {isIntroPlaying ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="h-5 w-5"
                      fill="currentColor"
                    >
                      <rect x="3" y="2" width="4" height="12" rx="1" />
                      <rect x="9" y="2" width="4" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="h-5 w-5"
                      fill="currentColor"
                    >
                      <path d="M4 2.5v11l9-5.5-9-5.5z" />
                    </svg>
                  )}
                </button>
              )}
              <input
                type="range"
                min="0"
                max={introDurationValue}
                step="0.1"
                value={introSliderValue}
                onChange={handleIntroSeek}
                disabled={
                  audioControlsDisabled ||
                  !showIntroControls ||
                  introDurationValue <= 0
                }
                aria-label="Intro playback position"
                style={{
                  background: `linear-gradient(to right, #fff ${introProgressPercent}%, rgba(255, 255, 255, 0.3) ${introProgressPercent}%)`,
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
              />
              {showIntroControls && (
                <button
                  type="button"
                  onClick={() => interruptIntroPlayback()}
                  aria-label="Stop intro"
                  className="p-1 text-white disabled:opacity-40"
                  disabled={disableStop || audioControlsDisabled}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <rect x="3" y="3" width="10" height="10" rx="1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {showControlButton && (
          <>
            {!isConnected && !isConnecting && (
              <button
                onClick={connectHere}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Start Conversation
              </button>
            )}
            {isConnecting && (
              <button
                disabled
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Connecting...
              </button>
            )}
            {isConnected && (
              <button
                onClick={disconnectHere}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                End Conversation
              </button>
            )}
          </>
        )}

        {isCelebrating && !isConnected && (
          <button
            type="button"
            onClick={() => onNavigate?.("progress")}
            className="bg-white text-black font-bold py-2 px-4 rounded-lg w-full mt-2"
          >
            See your progress
          </button>
        )}
      </div>

      {showThinkingBadge && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
            {thinkingLabel}
          </div>
        </div>
      )}
    </div>
  );
};
