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
import {
  useVoiceBot,
  VoiceBotStatus,
} from "../context/VoiceBotContextProvider.jsx";
import { isMobile } from "react-device-detect";

import { usePipecatConnection } from "../hooks/usePipecatConnection";

export const TalkWithBook = ({
  botConfig,
  onNavigate,
  selectedBook,
  chapter,
  currentCharacter,
  userName = "",
  studentId = null,
  showControlButton = false,
  onDisconnectRequest,
  connectionManagedExternally = false,
}) => {
  const client = usePipecatClient();
  const logsRef = useRef(null);

  const startedHereRef = useRef(false);
  const startedChatRef = useRef(false);

  const [isMicActive, setIsMicActive] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [serverEvent, setServerEvent] = useState(null);

  const {
    addVoicebotMessage,
    setConversationConfig,
    startListening,
    startSpeaking,
    startThinking,
    status,
  } = useVoiceBot();

  const { enableMic } = usePipecatClientMicControl();

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
  useEffect(() => {
    if (studentId && selectedBook?.id) {
      setConversationConfig({
        studentId,
        bookId: selectedBook.id,
        autoSave: true,
      });
    }
  }, [studentId, selectedBook?.id, setConversationConfig]);

  const addLog = (msg) => {
    if (logsRef.current) {
      logsRef.current.textContent += `\n${msg}`;
    }
    console.log(`LOG: ${msg}`);
  };

  // 🔹 Unified mic sync helper
  const syncMic = useCallback(
    (enabled = true) => {
      console.log(
        `🎤 syncMic called with enabled=${enabled}, isConnected=${isConnected}`,
      );

      // Don't try to send messages if not connected
      if (!isConnected) {
        console.warn("⚠️ Cannot sync mic - not connected yet");
        return;
      }

      try {
        enableMic(enabled);
        if (enabled) {
          sendClientMessage("control", { action: "resumeListening" });
          startListening();
          console.log("✅ Mic enabled and listening resumed");
        } else {
          console.log("✅ Mic disabled");
        }
      } catch (e) {
        console.error("❌ Mic sync failed", e);
      }
    },
    [enableMic, sendClientMessage, startListening, isConnected],
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
    await connect({ botConfig, userName, selectedBook, chapter });
  }, [connect, botConfig, userName, selectedBook, chapter]);

  const disconnectHere = useCallback(async () => {
    console.log("🔴 disconnectHere called");

    // Disable mic first
    try {
      enableMic(false);
    } catch (e) {
      console.warn("Failed to disable mic:", e);
    }

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

        // CRITICAL: Enable mic when bot is ready
        syncMic(true);

        try {
          sendClientMessage("start-chat", {
            book_id: selectedBook.id,
            chapter: chapter ?? "",
            chapter_old: String(botConfig?.metadata?.book?.progress) ?? "",
          });
          startedChatRef.current = true;
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
    const onBotTranscript = (data) => {
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
    client.on(RTVIEvent.BotTranscript, onBotTranscript);
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
      client.off(RTVIEvent.BotTranscript, onBotTranscript);
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
          syncMic(true);
          sendClientMessage("set-language", { language: "en-US" });
          sendClientMessage("start-chat", { greeting: botConfig?.greeting });
          startedChatRef.current = true;
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
    botConfig?.greeting,
    syncMic,
    sendClientMessage,
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

  const renderedServerContent = useMemo(() => {
    if (modalityKey.includes("vocab")) {
      return <VocabularyPanel event={serverEvent} isWaiting={!serverEvent} />;
    }

    if (!serverEvent) {
      return (
        <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-gray-500">
          Start chatting with Miotomo to see updates here.
        </div>
      );
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
  }, [modalityKey, serverEvent]);

  const characterAccent = currentCharacter?.customBg ?? "";
  const characterBgClass = currentCharacter?.bg ?? "";
  const talkBackgroundStyle = useMemo(() => {
    if (!characterAccent) return undefined;
    return {
      backgroundColor: characterAccent,
    };
  }, [characterAccent]);

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
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <AnimationManager
          agentVoiceAnalyser={agentVoiceAnalyser?.analyser || null}
          userVoiceAnalyser={userVoiceAnalyser?.analyser || null}
          isUserSpeaking={isMicActive}
          isBotSpeaking={isBotSpeaking}
          characterImages={currentCharacter?.images}
          characterName={currentCharacter?.name}
        />

        {isBotThinking && (
          <div className="flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
            Tomo is thinking...
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

        {status === VoiceBotStatus.SLEEPING && (
          <div className="text-gray-400 text-sm">
            I've stopped listening. {isMobile ? "Tap" : "Click"} to resume.
          </div>
        )}
      </div>
    </div>
  );
};
