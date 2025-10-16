import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  usePipecatClient,
  usePipecatClientMediaTrack,
  usePipecatClientMicControl,
} from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import BookTitle from "./layout/BookTitle.jsx";
import AnimationManager from "./layout/AnimationManager";
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
}) => {
  const client = usePipecatClient();
  const logsRef = useRef(null);

  const startedHereRef = useRef(false);
  const startedChatRef = useRef(false);

  const [isMicActive, setIsMicActive] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  const {
    addVoicebotMessage,
    setConversationConfig,
    startListening,
    startSpeaking,
    status,
  } = useVoiceBot();

  const { enableMic } = usePipecatClientMicControl();

  // 🎤 Tracks
  const localAudioTrack = usePipecatClientMediaTrack("audio", "local");
  const botAudioTrack = usePipecatClientMediaTrack("audio", "bot");

  // 🔹 Helper to create analyser safely
  const createAnalyser = (track) => {
    if (!track) return null;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    const src = ctx.createMediaStreamSource(new MediaStream([track]));
    src.connect(analyser);
    return { analyser, ctx };
  };

  // Analysers
  const userVoiceAnalyser = useMemo(
    () => createAnalyser(localAudioTrack),
    [localAudioTrack],
  );
  const agentVoiceAnalyser = useMemo(
    () => createAnalyser(botAudioTrack),
    [botAudioTrack],
  );

  // Cleanup audio contexts to avoid leaks
  useEffect(() => {
    return () => {
      userVoiceAnalyser?.ctx?.close();
    };
  }, [userVoiceAnalyser]);
  useEffect(() => {
    return () => {
      agentVoiceAnalyser?.ctx?.close();
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
      logsRef.current.textContent += `\n${msg}`; // append instead of overwrite
    }
    console.log(`LOG: ${msg}`);
  };

  // 🔹 Unified mic sync helper
  const syncMic = useCallback(
    (enabled = true) => {
      try {
        enableMic(enabled);
        if (enabled) {
          sendClientMessage("control", { action: "resumeListening" });
          startListening();
        }
      } catch (e) {
        console.warn("Mic sync failed", e);
      }
    },
    [enableMic, sendClientMessage, startListening],
  );

  // Wrap connect/disconnect to mark ownership
  const connectHere = useCallback(async () => {
    console.log("connectHere");
    startedHereRef.current = true;
    await connect({ botConfig, userName, selectedBook, chapter });
  }, [connect, botConfig, userName, selectedBook, chapter]);

  const disconnectHere = useCallback(async () => {
    console.log("disconnectHere");
    startedHereRef.current = false;
    await disconnect();
  }, [disconnect]);

  // Allow parent to trigger disconnect
  useEffect(() => {
    if (!onDisconnectRequest) return;
    onDisconnectRequest.current = disconnectHere;
    return () => {
      onDisconnectRequest.current = null;
    };
  }, [onDisconnectRequest, disconnectHere]);

  // ✅ Guard for repeated checks
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
      enableMic(false); // Reset mic on disconnect
      startedChatRef.current = false;
    };

    const onBotReady = () => {
      addLog("🤖 Bot ready!");
      syncMic(true);

      if (startedChatRef.current) return;
      try {
        sendClientMessage("start-chat", {
          book_id: selectedBook.id,
          chapter: chapter ?? "",
          chapter_old: String(botConfig?.metadata?.book?.progress) ?? "",
        });
        startedChatRef.current = true;
      } catch (error) {
        console.error("Error sending start messages:", error);
      }
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
      startSpeaking();
    };
    const onBotStoppedSpeaking = () => setIsBotSpeaking(false);

    const onUserTranscript = (data) => {
      if (data.final) {
        addVoicebotMessage({ user: data.text });
        startListening();
      }
    };
    const onBotTranscript = (data) => {
      addVoicebotMessage({ assistant: data.text });
    };

    client.on(RTVIEvent.Connected, onConnected);
    client.on(RTVIEvent.Disconnected, onDisconnected);
    client.on(RTVIEvent.BotReady, onBotReady);
    client.on(RTVIEvent.UserStartedSpeaking, onUserStartedSpeaking);
    client.on(RTVIEvent.UserStoppedSpeaking, onUserStoppedSpeaking);
    client.on(RTVIEvent.BotStartedSpeaking, onBotStartedSpeaking);
    client.on(RTVIEvent.BotStoppedSpeaking, onBotStoppedSpeaking);
    client.on(RTVIEvent.UserTranscript, onUserTranscript);
    client.on(RTVIEvent.BotTranscript, onBotTranscript);

    return () => {
      client.off(RTVIEvent.Connected, onConnected);
      client.off(RTVIEvent.Disconnected, onDisconnected);
      client.off(RTVIEvent.BotReady, onBotReady);
      client.off(RTVIEvent.UserStartedSpeaking, onUserStartedSpeaking);
      client.off(RTVIEvent.UserStoppedSpeaking, onUserStoppedSpeaking);
      client.off(RTVIEvent.BotStartedSpeaking, onBotStartedSpeaking);
      client.off(RTVIEvent.BotStoppedSpeaking, onBotStoppedSpeaking);
      client.off(RTVIEvent.UserTranscript, onUserTranscript);
      client.off(RTVIEvent.BotTranscript, onBotTranscript);
    };
  }, [
    client,
    enableMic,
    sendClientMessage,
    addVoicebotMessage,
    startListening,
    startSpeaking,
  ]);

  // --- Auto-connect when button is hidden ---
  useEffect(() => {
    if (
      !showControlButton &&
      !isConnected &&
      !isConnecting &&
      hasRequiredData
    ) {
      connectHere().catch((err) => console.error("Auto-connect failed", err));
    }
  }, [
    showControlButton,
    isConnected,
    isConnecting,
    hasRequiredData,
    connectHere,
  ]);

  // --- Fallback for missed BotReady (pre-connect case) ---
  useEffect(() => {
    if (
      !startedChatRef.current &&
      isConnected &&
      !isConnecting &&
      hasRequiredData
    ) {
      try {
        syncMic(true);
        sendClientMessage("set-language", { language: "en-US" });
        sendClientMessage("start-chat", { greeting: botConfig?.greeting });
        startedChatRef.current = true;
        addLog("start-chat sent (fallback)");
      } catch (e) {
        console.error("fallback start-chat failed:", e);
      }
    }
  }, [
    isConnected,
    isConnecting,
    hasRequiredData,
    botConfig?.greeting,
    syncMic,
    sendClientMessage,
  ]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      if (startedHereRef.current) {
        disconnectHere();
      }
    };
  }, [disconnectHere]);

  return (
    <div className="inset-0 flex flex-col overflow-hidden">
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

      <div
        ref={logsRef}
        className="absolute top-0 right-0 text-xs p-2 mt-4 whitespace-pre-line"
      />
      <div className="absolute left-0 right-0 bottom-20 flex flex-col items-center gap-2">
        <AnimationManager
          agentVoiceAnalyser={agentVoiceAnalyser?.analyser || null}
          userVoiceAnalyser={userVoiceAnalyser?.analyser || null}
          isUserSpeaking={isMicActive}
          isBotSpeaking={isBotSpeaking}
        />

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
