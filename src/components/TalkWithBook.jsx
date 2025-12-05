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
import {
  useVoiceBot,
  VoiceBotStatus,
} from "../context/VoiceBotContextProvider.jsx";
import { isMobile } from "react-device-detect";

import { usePipecatConnection } from "../hooks/usePipecatConnection";
import { useConversations } from "../hooks/useConversations";
import { useAnalytics } from "../hooks/useAnalytics";

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
}) => {
  const client = usePipecatClient();
  const logsRef = useRef(null);

  const startedHereRef = useRef(false);
  const startedChatRef = useRef(false);
  const userMutedRef = useRef(false);
  const micEnabledRef = useRef(false);
  const hadConversationRef = useRef(false);
  const hasSubmittedSummaryRef = useRef(false);

  const [isMicActive, setIsMicActive] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [serverEvent, setServerEvent] = useState(null);
  const [isCelebrating, setIsCelebrating] = useState(false);

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

  useEffect(() => {
    hasSubmittedSummaryRef.current = false;
    hadConversationRef.current = false;
  }, [selectedBook?.id, chapter]);

  const addLog = (msg) => {
    if (logsRef.current) {
      logsRef.current.textContent += `\n${msg}`;
    }
    console.log(`LOG: ${msg}`);
  };

  // 🔹 Unified mic sync helper
  const syncMic = useCallback(
    (enabled = true, options = {}) => {
      const { force = false } = options;
      console.log(
        `🎤 syncMic called with enabled=${enabled}, isConnected=${isConnected}, force=${force}`,
      );

      // Don't try to send messages if not connected
      if (!isConnected) {
        console.warn("⚠️ Cannot sync mic - not connected yet");
        return;
      }

      if (!force && enabled && userMutedRef.current) {
        console.log("⏸️ Mic paused by user - skipping auto resume");
        return;
      }

      if (!force && micEnabledRef.current === enabled) {
        console.log("ℹ️ Mic already in desired state - skipping sync");
        return;
      }

      try {
        enableMic(enabled);
        micEnabledRef.current = enabled;
        if (enabled) {
          sendClientMessage("control", { action: "resumeListening" });
          startListening();
          console.log("✅ Mic enabled and listening resumed");
        } else {
          sendClientMessage("control", { action: "pauseListening" });
          console.log("✅ Mic disabled");
        }
      } catch (e) {
        console.error("❌ Mic sync failed", e);
      }
    },
    [enableMic, sendClientMessage, startListening, isConnected],
  );

  const handleMicToggle = useCallback(
    (nextEnabled) => {
      userMutedRef.current = !nextEnabled;
      micEnabledRef.current = nextEnabled;
      if (nextEnabled) {
        startListening();
      }
    },
    [startListening],
  );

  // Reset refs when component mounts
  useEffect(() => {
    startedChatRef.current = false;
    return () => {
      startedChatRef.current = false;
    };
  }, []);

  // Wrap connect/disconnect to mark ownership
  const connectHere = useCallback(async () => {
    console.log("connectHere");
    startedHereRef.current = true;
    await connect({
      botConfig,
      userName,
      studentId,
      selectedBook,
      chapter,
      region,
    });
  }, [connect, botConfig, userName, studentId, selectedBook, chapter, region]);

  const disconnectHere = useCallback(async () => {
    console.log("🔴 disconnectHere called");

    // Disable mic first
    try {
      enableMic(false);
    } catch (e) {
      console.warn("Failed to disable mic:", e);
    }
    micEnabledRef.current = false;
    userMutedRef.current = false;

    startedHereRef.current = false;
    startedChatRef.current = false; // Reset chat started flag

    await disconnect();
  }, [disconnect, enableMic]);

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
      enableMic(false);
      micEnabledRef.current = false;
      userMutedRef.current = false;
      startedChatRef.current = false;
      setIsBotThinking(false);
    };

    const onBotReady = () => {
      addLog("🤖 Bot ready!");

      if (startedChatRef.current) {
        console.log("⚠️ Chat already started, skipping start-chat");
        return;
      }

      // Wait a bit for connection to fully stabilize before sending messages
      setTimeout(() => {
        if (!isConnected) {
          console.warn("⚠️ Bot ready but not connected yet, skipping mic sync");
          return;
        }

        // Wake up analytics service
        wakeAnalytics();

        // CRITICAL: Enable mic when bot is ready
        syncMic(true);

        try {
          sendClientMessage("start-chat", {
            book_id: selectedBook.id,
            chapter: chapter ?? "",
            chapter_old: String(botConfig?.metadata?.book?.progress) ?? "",
          });
          startedChatRef.current = true;
          hadConversationRef.current = true;
          addLog("✅ start-chat sent");
        } catch (error) {
          console.error("Error sending start messages:", error);
        }
      }, 200);
    };

    const onUserStartedSpeaking = () => {
      console.log("User started speaking");
      setIsMicActive(true);
    };

    const onUserStoppedSpeaking = () => {
      console.log("User stopped speaking");
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
      if (!isBotSpeaking) {
        startListening();
      }
    };

    const onUserTranscript = (data) => {
      if (data.final) {
        addVoicebotMessage({ user: data.text });
        startListening();
      }
    };
    const onBotOutput = (data) => {
      console.log("onBotOutput", data);
      addVoicebotMessage({ assistant: data.text });
    };

    const onServerMessage = (msg) => {
      console.log("!!!! Server message:", msg);
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
    sendClientMessage,
    addVoicebotMessage,
    startListening,
    startSpeaking,
    startThinking,
    syncMic,
    isBotSpeaking,
    selectedBook?.id,
    chapter,
    botConfig?.metadata?.book?.progress,
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

    // Check if client is already connecting
    const clientState = client?.state;
    if (clientState === "ready" || clientState === "connecting") {
      console.log(
        "⏭️ TalkWithBook: Client already",
        clientState,
        "- skipping auto-connect",
      );
      return;
    }

    console.log("🎯 TalkWithBook: Auto-connecting...");
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

  // --- Fallback for missed BotReady (pre-connect case) ---
  useEffect(() => {
    if (
      !startedChatRef.current &&
      isConnected &&
      !isConnecting &&
      hasRequiredData
    ) {
      console.log("🔧 Fallback: Bot connected but chat not started");

      // Wait a bit to ensure connection is fully ready
      const timer = setTimeout(() => {
        try {
          // Wake up analytics service
          wakeAnalytics();

          syncMic(true);
          sendClientMessage("set-language", { language: "en-US" });
          sendClientMessage("start-chat", {
            book_id: selectedBook.id,
            chapter: chapter ?? "",
            chapter_old: String(botConfig?.metadata?.book?.progress) ?? "",
          });
          startedChatRef.current = true;
          hadConversationRef.current = true;
          addLog("start-chat sent (fallback)");
        } catch (e) {
          console.error("fallback start-chat failed:", e);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [
    isConnected,
    isConnecting,
    hasRequiredData,
    syncMic,
    sendClientMessage,
    selectedBook?.id,
    chapter,
    botConfig?.metadata?.book?.progress,
  ]);

  // --- Safety: Re-enable mic if connected but not active ---
  useEffect(() => {
    if (isConnected && !isConnecting && hasRequiredData) {
      const timer = setTimeout(() => {
        console.log("🔍 Safety check: Ensuring mic is enabled");
        syncMic(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isConnecting, hasRequiredData, syncMic]);

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
    if (isCelebrating) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-6 py-5 text-center text-gray-800">
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
        <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700">
          {typeof serverEvent === "string"
            ? serverEvent
            : JSON.stringify(serverEvent, null, 2)}
        </pre>
      </div>
    );
  }, [panelKey, serverEvent, eventMeta.eventType, isCelebrating]);

  const characterAccent = currentCharacter?.customBg ?? "";
  const characterBgClass = currentCharacter?.bg ?? "";
  const talkBackgroundStyle = useMemo(() => {
    if (!characterAccent) return undefined;
    return {
      backgroundColor: characterAccent,
    };
  }, [characterAccent]);

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

  return (
    <div
      className={`inset-0 flex min-h-screen flex-col overflow-hidden transition-colors duration-500 ${characterBgClass}`}
      style={talkBackgroundStyle}
    >
      <div className="flex-none">
        <BookTitle
          book={selectedBook}
          chapter={chapter}
          onBack={() => {
            disconnectHere();
            onNavigate?.("map");
          }}
        />
      </div>

      <div className="flex-1 px-6 pt-4 overflow-hidden">
        <div className="h-full w-full">{renderedServerContent}</div>
      </div>

      <div
        ref={logsRef}
        className="absolute top-0 right-0 text-xs p-2 mt-4 whitespace-pre-line"
      />
      <div className="absolute inset-x-0 bottom-28 flex flex-col items-center gap-3 px-4">
        <div className="flex justify-center">
          <AnimationManager
            agentVoiceAnalyser={agentVoiceAnalyser?.analyser || null}
            userVoiceAnalyser={userVoiceAnalyser?.analyser || null}
            isUserSpeaking={isMicActive}
            isBotSpeaking={isBotSpeaking}
            characterImages={currentCharacter?.images}
            characterName={currentCharacter?.name}
            onMicToggle={handleMicToggle}
            isCelebrating={isCelebrating}
          />
        </div>

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

        {status === VoiceBotStatus.SLEEPING && (
          <div className="text-black-400 text-sm">Come back tomorrow!</div>
        )}

        {isCelebrating && !isConnected && (
          <button
            type="button"
            onClick={() => onNavigate?.("progress")}
            className="bg-black text-white font-bold py-2 px-4 rounded-lg w-full mt-2"
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
