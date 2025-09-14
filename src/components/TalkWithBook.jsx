import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  usePipecatClient,
  usePipecatClientMediaTrack,
  useRTVIClientEvent,
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

export const TalkWithBook = ({
  botConfig,
  onNavigate,
  selectedBook,
  chapter,
  currentCharacter,
  userName = "",
  studentId = null,
  // Hide control button by default; when hidden we auto-connect
  showControlButton = false,
  // A ref-like object from the parent so it can call disconnect()
  onDisconnectRequest,
}) => {
  const client = usePipecatClient();
  const logsRef = useRef(null);
  const startedRef = useRef(false); // prevent duplicate auto-connects

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  const {
    addVoicebotMessage,
    setConversationConfig,
    startListening,
    startSpeaking,
    status,
  } = useVoiceBot();

  // 🎤 Get mic & bot audio tracks from Pipecat
  const localAudioTrack = usePipecatClientMediaTrack("audio", "local");
  const botAudioTrack = usePipecatClientMediaTrack("audio", "bot");

  // Create analysers from those tracks
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

  // Conversation/session metadata for persistence
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
      // logsRef.current.textContent = msg;
    }
    console.log(`LOG: ${msg}`);
  };

  // --- Connection handlers -------------------------------------------------

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // const proxyServerURL = "https://pipecat-proxy-server.onrender.com";
      console.log("client", client);
      console.log("botConfig", botConfig);
      if (botConfig?.transportType === "daily") {
        const proxyServerURL =
          "https://littleark--a3f08acc7cb911f08eaf0224a6c84d84.web.val.run";
        const response = await fetch(`${proxyServerURL}/connect-pipecat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: botConfig }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const { room_url, token } = await response.json();
        console.log(room_url, token);
        await client.connect({ room_url, token });
      } else {
        await client.connect({
          webrtcUrl: `http://localhost:8000/api/offer?student=${encodeURIComponent(
            userName,
          )}&chapter_old=${encodeURIComponent(
            botConfig.metadata.book.progress,
          )}&chapter=${encodeURIComponent(
            chapter,
          )}&book_id=${encodeURIComponent(
            selectedBook.id,
          )}&book=${encodeURIComponent(
            selectedBook.title,
          )}&prompt=${encodeURIComponent(
            botConfig.metadata.character.prompt,
          )}&section_type=${encodeURIComponent(
            botConfig.metadata.book.section_type,
          )}&character_name=${encodeURIComponent(
            botConfig.metadata.character.name,
          )}`,
          // connectionUrl: `http://localhost:7860/api/offer`,
        });
      }

      addLog("Connection initiated");
    } catch (err) {
      console.error("Connection failed:", err);
      setIsConnecting(false);
      startedRef.current = false; // allow retry on failure
    }
  }, [client, botConfig, userName, chapter, selectedBook]);

  const handleDisconnect = useCallback(async () => {
    try {
      await client.disconnect();
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  }, [client]);

  // Allow parent (BottomNavBar navigation) to trigger a disconnect
  useEffect(() => {
    if (!onDisconnectRequest) return;
    onDisconnectRequest.current = handleDisconnect;
    return () => {
      onDisconnectRequest.current = null;
    };
  }, [onDisconnectRequest, handleDisconnect]);

  // --- Pipecat event bindings (MOUNT BEFORE auto-connect) ------------------
  useEffect(() => {
    if (!client) return;

    const onConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      addLog("Connected to Pipecat bot");
      // client.sendClientMessage("start-chat");
    };
    const onDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
      addLog("Disconnected");
    };
    const onBotReady = () => {
      addLog("Bot ready! Start talking.");
      try {
        console.log("SENDING MESSAGE");
        // client.sendClientMessage("set-language", { language: "en-US" });
        client.sendClientMessage("start-chat");
      } catch (error) {
        console.error("Error sending message to server:", error);
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
  }, [client, addVoicebotMessage, startListening, startSpeaking]);

  // --- Auto-connect when button is hidden ----------------------------------
  useEffect(() => {
    if (showControlButton) return; // only autostart when hidden
    if (startedRef.current) return; // prevent double-start
    if (!client) return; // need client
    if (!botConfig) return; // need config
    if (!selectedBook?.id || !chapter || !currentCharacter) return; // need inputs

    startedRef.current = true;
    // microtask to ensure listener effect above has committed
    setTimeout(() => {
      handleConnect();
    }, 0);
  }, [
    showControlButton,
    client,
    botConfig,
    selectedBook?.id,
    chapter,
    currentCharacter,
    handleConnect,
  ]);

  // --- Autoplay/mic gating fallback: start on first interaction ------------
  useEffect(() => {
    if (showControlButton) return; // only relevant when auto-starting

    const onFirstInteraction = async () => {
      try {
        userVoiceAnalyser?.context?.resume?.();
      } catch {}
      try {
        agentVoiceAnalyser?.context?.resume?.();
      } catch {}

      if (!isConnected && !isConnecting && !startedRef.current) {
        startedRef.current = true;
        handleConnect();
      }

      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };

    window.addEventListener("click", onFirstInteraction, { once: true });
    window.addEventListener("touchstart", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, [
    showControlButton,
    isConnected,
    isConnecting,
    userVoiceAnalyser,
    agentVoiceAnalyser,
    handleConnect,
  ]);

  // --- Cleanup on unmount ---------------------------------------------------
  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, [handleDisconnect]);

  return (
    <div className="inset-0 flex flex-col overflow-hidden">
      <div className="flex-none">
        <BookTitle
          book={selectedBook}
          chapter={chapter}
          onBack={() => {
            handleDisconnect();
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

      {/* Microphone orb */}
      <div className="absolute left-0 right-0 bottom-20 flex flex-col items-center gap-2">
        <AnimationManager
          agentVoiceAnalyser={agentVoiceAnalyser}
          userVoiceAnalyser={userVoiceAnalyser}
        />
        {showControlButton && (
          <>
            {!isConnected && !isConnecting && (
              <button
                onClick={handleConnect}
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
                onClick={handleDisconnect}
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
