import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  usePipecatClient,
  usePipecatClientMediaTrack,
  usePipecatClientMicControl,
} from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import BookTitle from "./layout/BookTitle.jsx";
import Transcript from "./features/voice/Transcript.jsx";
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

  // ✅ Mic control hook (keeps UI state in sync)
  const { enableMic } = usePipecatClientMicControl();

  // 🎤 Tracks
  const localAudioTrack = usePipecatClientMediaTrack("audio", "local");
  const botAudioTrack = usePipecatClientMediaTrack("audio", "bot");

  // Analysers
  const userVoiceAnalyser = useMemo(() => {
    if (!localAudioTrack) return null;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    const src = ctx.createMediaStreamSource(new MediaStream([localAudioTrack]));
    src.connect(analyser);
    return analyser;
  }, [localAudioTrack]);

  const agentVoiceAnalyser = useMemo(() => {
    if (!botAudioTrack) return null;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    const src = ctx.createMediaStreamSource(new MediaStream([botAudioTrack]));
    src.connect(analyser);
    return analyser;
  }, [botAudioTrack]);

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
      logsRef.current.textContent = msg;
    }
    console.log(`LOG: ${msg}`);
  };

  // Wrap connect/disconnect to mark ownership
  const connectHere = useCallback(async () => {
    startedHereRef.current = true;
    await connect({ botConfig, userName, selectedBook, chapter });
  }, [connect, botConfig, userName, selectedBook, chapter]);

  const disconnectHere = useCallback(async () => {
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

  // ---- Pipecat event bindings ----
  useEffect(() => {
    if (!client) return;

    const onConnected = () => {
      addLog("Connected to Pipecat bot");
      startedChatRef.current = false;
      // Do NOT force mic here; we do it on BotReady (or fallback).
    };

    const onDisconnected = () => {
      addLog("Disconnected");
      enableMic(false);
      startedChatRef.current = false;
    };

    const onBotReady = () => {
      addLog("Bot ready!");
      // ✅ Force mic ON via hook so UI reflects it
      try {
        enableMic(true); // updates isMicEnabled used by AnimationManager
        // Also align server + UI “mode”
        sendClientMessage("control", { action: "resumeListening" });
        startListening(); // set VoiceBotStatus to LISTENING visually
        console.log("Mic set ON on BotReady (hook)");
      } catch (e) {
        console.warn("Mic reset on BotReady failed", e);
      }

      if (startedChatRef.current) return;
      try {
        // sendClientMessage("set-language", { language: "en-US" });
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

    const onUserStartedSpeaking = () => setIsMicActive(true);
    const onUserStoppedSpeaking = () => setIsMicActive(false);
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
    botConfig?.greeting,
    addVoicebotMessage,
    startListening,
    startSpeaking,
  ]);

  // --- Auto-connect when button is hidden ---
  useEffect(() => {
    if (!showControlButton && !isConnected && !isConnecting) {
      if (botConfig && selectedBook?.id && chapter && currentCharacter) {
        connectHere().catch((err) => console.error("Auto-connect failed", err));
      }
    }
  }, [
    showControlButton,
    isConnected,
    isConnecting,
    botConfig,
    selectedBook?.id,
    chapter,
    currentCharacter,
    connectHere,
  ]);

  // --- Fallback for missed BotReady (pre-connect case) ---
  useEffect(() => {
    if (
      !startedChatRef.current &&
      isConnected &&
      !isConnecting &&
      botConfig &&
      selectedBook?.id &&
      chapter &&
      currentCharacter
    ) {
      try {
        // ✅ Mirror BotReady path: ensure mic + UI state are synced
        enableMic(true);
        sendClientMessage("control", { action: "resumeListening" });
        startListening();
        console.log("Mic set ON via fallback (hook)");

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
    botConfig,
    selectedBook?.id,
    chapter,
    currentCharacter,
    enableMic,
    sendClientMessage,
    startListening,
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
        className="absolute left-0 right-0 overflow-y-auto overflow-x-hidden"
        style={{ top: "92px", bottom: "176px" }}
      >
        <Transcript userName={userName} currentCharacter={currentCharacter} />
        <div
          ref={logsRef}
          className="absolute bottom-0 text-xs p-2 bg-gray-100 mt-4"
        />
      </div>

      <div className="absolute left-0 right-0 bottom-20 flex flex-col items-center gap-2">
        <AnimationManager
          agentVoiceAnalyser={agentVoiceAnalyser}
          userVoiceAnalyser={userVoiceAnalyser}
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
