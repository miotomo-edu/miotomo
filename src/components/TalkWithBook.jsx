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
}) => {
  const client = usePipecatClient();
  const logsRef = useRef(null);

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
      // logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
    console.log(`LOG: ${msg}`);
  };

  // Send prompt when bot is ready
  // useRTVIClientEvent(
  //   RTVIEvent.BotConnected,
  //   useCallback(() => {
  //     // Bot is ready - send the initial prompt
  //     addLog("Bot is ready - send the initial prompt");
  //     client.sendClientMessage("set-prompt", { prompt: "prompt_1" });
  //   }, [client]),
  // );

  // // Handle server responses
  // useRTVIClientEvent(
  //   RTVIEvent.ServerMessage,
  //   useCallback((message) => {
  //     if (message.data.msg === "prompt-set") {
  //       console.log("Prompt set successfully");
  //     }
  //   }, []),
  // );

  // Pipecat event bindings
  useEffect(() => {
    if (!client) return;

    const onConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      addLog("Connected to Pipecat bot");
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
        client.sendClientMessage("set-language", { language: "en-US" });
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
    const onServerMessage = (message) => {
      console.log("Received message from server:", message);
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
    // client.on(RTVIEvent.ServerMessage, onServerMessage);

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
      // client.on(RTVIEvent.ServerMessage, onServerMessage);
    };
  }, [client, addVoicebotMessage, startListening, startSpeaking]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // const proxyServerURL = "https://pipecat-proxy-server.onrender.com";
      const proxyServerURL = "http://localhost:3001";
      console.log("client", client);
      if (botConfig?.transportType === "daily") {
        let cxnDetails = await client.startBot({
          endpoint: `${proxyServerURL}/connect-pipecat`,
          requestData: {
            config: botConfig,
          },
        });
        // cxnDetails = modifyCxnDetails(cxnDetails); // Modify if needed
        console.log("cxnDetails", cxnDetails);
        await client.connect(cxnDetails);
        // const response = await fetch(`${proxyServerURL}/connect-pipecat`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ config: botConfig }),
        // });

        // if (!response.ok) {
        //   const errData = await response.json();
        //   throw new Error(errData.error || `HTTP ${response.status}`);
        // }

        // const { room_url, token } = await response.json();
        // console.log(room_url, token);
        // await client.connect({ room_url, token });
      } else {
        await client.connect({
          webrtcUrl: `http://localhost:8000/api/offer?username=${encodeURIComponent(userName)}&chapter=${encodeURIComponent(chapter)}&book=${encodeURIComponent(selectedBook.title)}&prompt=${encodeURIComponent("storytelling")}`,
        });
      }

      addLog("Connection initiated");
    } catch (err) {
      console.error("Connection failed:", err);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await client.disconnect();
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

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

        {!isConnected && !isConnecting && (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Start Conversation
          </button>
        )}
        {isConnecting && (
          <button disabled className="px-4 py-2 bg-gray-400 text-white rounded">
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
        {status === VoiceBotStatus.SLEEPING && (
          <div className="text-gray-400 text-sm">
            I've stopped listening. {isMobile ? "Tap" : "Click"} to resume.
          </div>
        )}
      </div>
    </div>
  );
};
