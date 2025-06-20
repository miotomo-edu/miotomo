import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import Transcript from "./features/voice/Transcript.jsx";
import { useDeepgram } from "../context/DeepgramContextProvider.jsx";
import { useMicrophone } from "../context/MicrophoneContextProvider.jsx";
import {
  EventType,
  useVoiceBot,
  VoiceBotStatus,
} from "../context/VoiceBotContextProvider.jsx";
import { createAudioBuffer, playAudioBuffer } from "../utils/audioUtils.js";
import { sendSocketMessage, sendMicToSocket } from "../utils/deepgramUtils.js";
import { isMobile } from "react-device-detect";
import { usePrevious } from "@uidotdev/usehooks";
import { useStsQueryParams } from "../hooks/UseStsQueryParams.jsx";
import RateLimited from "./RateLimited.jsx";
import BookTitle from "./layout/BookTitle.jsx";

const AnimationManager = lazy(() => import("./layout/AnimationManager.jsx"));

export const TalkWithBook = ({
  defaultStsConfig,
  onMessageEvent = () => {},
  requiresUserActionToInitialize = false,
  className = "",
  onNavigate,
  selectedBook,
  userName = "",
  studentId = null,
}) => {
  const { disconnectFromDeepgram } = useDeepgram();
  const { cleanupMicrophone } = useMicrophone();
  useEffect(() => {
    return () => {
      if (typeof disconnectFromDeepgram === "function") {
        disconnectFromDeepgram();
      }
      cleanupMicrophone();
    };
  }, []);

  const {
    status,
    messages,
    addVoicebotMessage,
    messageCount,
    addBehindTheScenesEvent,
    isWaitingForUserVoiceAfterSleep,
    toggleSleep,
    startListening,
    startSpeaking,
    setConversationConfig,
    conversationSaving,
  } = useVoiceBot();
  const {
    setupMicrophone,
    microphone,
    microphoneState,
    processor,
    microphoneAudioContext,
    startMicrophone,
  } = useMicrophone();
  const { socket, connectToDeepgram, socketState, rateLimited } = useDeepgram();
  const { voice, instructions, applyParamsToConfig } = useStsQueryParams();
  const audioContext = useRef(null);
  const agentVoiceAnalyser = useRef(null);
  const userVoiceAnalyser = useRef(null);
  const startTimeRef = useRef(-1);
  const [data, setData] = useState();
  const [exchangeCount, setExchangeCount] = useState(0);
  const [shouldSpell, setShouldSpell] = useState(false);
  const [isInitialized, setIsInitialized] = useState(
    requiresUserActionToInitialize ? false : null,
  );
  const previousVoice = usePrevious(voice);
  const previousInstructions = usePrevious(instructions);
  const scheduledAudioSources = useRef([]);
  const [isRootPath, setIsRootPath] = useState(
    window.location.pathname === "/",
  );
  const [activeTab, setActiveTab] = useState("clinical-notes");

  // Enable automatic conversation saving when component mounts
  useEffect(() => {
    if (studentId && selectedBook?.id) {
      console.log(
        "Setting up auto-save for student:",
        studentId,
        "book:",
        selectedBook.id,
      );
      setConversationConfig({
        studentId: studentId,
        bookId: selectedBook.id,
        autoSave: true,
      });
    } else {
      // Disable auto-save if we don't have the required data
      setConversationConfig({
        studentId: null,
        bookId: null,
        autoSave: false,
      });
    }
  }, [studentId, selectedBook?.id, setConversationConfig]);

  // AUDIO MANAGEMENT
  /**
   * Initialize the audio context for managing and playing audio. (just for TTS playback; user audio input logic found in Microphone Context Provider)
   */
  useEffect(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext ||
        window.webkitAudioContext)({
        latencyHint: "interactive",
        sampleRate: 24000,
      });
      agentVoiceAnalyser.current = audioContext.current.createAnalyser();
      agentVoiceAnalyser.current.fftSize = 2048;
      agentVoiceAnalyser.current.smoothingTimeConstant = 0.96;
    }
  }, []);

  // useEffect(() => {
  //   if (messageCount === 3) {
  //     addVoicebotMessage({ assistant: "THREE" });
  //   }
  // }, [messageCount, addVoicebotMessage]);

  /**
   * Callback to handle audio data processing and playback.
   * Converts raw audio into an AudioBuffer and plays the processed audio through the web audio context
   */
  const bufferAudio = useCallback((data) => {
    const audioBuffer = createAudioBuffer(audioContext.current, data);
    if (!audioBuffer) return;
    scheduledAudioSources.current.push(
      playAudioBuffer(
        audioContext.current,
        audioBuffer,
        startTimeRef,
        agentVoiceAnalyser.current,
      ),
    );
  }, []);

  const clearAudioBuffer = () => {
    scheduledAudioSources.current.forEach((source) => source.stop());
    scheduledAudioSources.current = [];
  };

  // MICROPHONE AND SOCKET MANAGEMENT
  useEffect(() => {
    console.log("Initial setup - calling setupMicrophone()");
    // Only setup automatically if not requiring user action
    if (microphoneState === null && !requiresUserActionToInitialize) {
      setupMicrophone();
    }
  }, [microphoneState, requiresUserActionToInitialize]);

  useEffect(() => {
    console.log("Microphone state changed:", {
      microphoneState,
      hasSocket: !!socket,
      hasConfig: !!defaultStsConfig,
    });
    if (microphoneState === 1 && socket && defaultStsConfig) {
      const onOpen = () => {
        console.log("Socket opened - sending Settings message");
        const combinedStsConfig = {
          ...defaultStsConfig,
          agent: {
            ...defaultStsConfig.agent,
            think: {
              ...defaultStsConfig.agent.think,
              prompt: `${defaultStsConfig.agent.think.prompt}\n${instructions}`,
            },
          },
        };
        sendSocketMessage(socket, combinedStsConfig);

        // Wait for Settings to be processed before starting microphone
        setTimeout(() => {
          console.log("Starting microphone after Settings sent");
          startMicrophone();
          if (isRootPath) {
            startSpeaking(true);
            isWaitingForUserVoiceAfterSleep.current = false;
          } else {
            startListening(true);
          }
        }, 1000); // Give a small delay to ensure Settings is processed
      };

      socket.addEventListener("open", onOpen);
      return () => {
        socket.removeEventListener("open", onOpen);
        microphone.ondataavailable = null;
      };
    }
  }, [microphone, socket, microphoneState, defaultStsConfig, isRootPath]);

  useEffect(() => {
    console.log("Checking processor setup:", {
      hasMicrophone: !!microphone,
      hasSocket: !!socket,
      microphoneState,
      socketState,
    });
    if (!microphone) return;
    if (!socket) return;
    if (microphoneState !== 2) return;
    if (socketState !== 1) return;

    // Only set up audio processor after Settings has been sent
    const setupProcessor = () => {
      console.log("Setting up audio processor");
      processor.onaudioprocess = sendMicToSocket(socket);
    };

    // Add a small delay to ensure Settings is processed
    setTimeout(setupProcessor, 1500);

    // CLEANUP: Remove the audio processor handler when effect dependencies change or component unmounts
    return () => {
      if (processor) {
        console.log("shutting down audio processor");
        processor.onaudioprocess = null;
        try {
          processor.disconnect();
        } catch (e) {}
        try {
          microphone?.disconnect?.(processor);
        } catch (e) {}
      }
    };
  }, [microphone, socket, microphoneState, socketState, processor]);

  /**
   * Create AnalyserNode for user microphone audio context.
   * Exposes audio time / frequency data which is used in the
   * AnimationManager to scale the animations in response to user/agent voice
   */
  useEffect(() => {
    if (microphoneAudioContext) {
      userVoiceAnalyser.current = microphoneAudioContext.createAnalyser();
      userVoiceAnalyser.current.fftSize = 2048;
      userVoiceAnalyser.current.smoothingTimeConstant = 0.96;
      microphone.connect(userVoiceAnalyser.current);
    }
  }, [microphoneAudioContext, microphone]);

  /**
   * Handles incoming WebSocket messages. Differentiates between ArrayBuffer data and other data types (basically just string type).
   * */
  const onMessage = useCallback(
    async (event) => {
      if (event.data instanceof ArrayBuffer) {
        if (
          status !== VoiceBotStatus.SLEEPING &&
          !isWaitingForUserVoiceAfterSleep.current
        ) {
          bufferAudio(event.data); // Process the ArrayBuffer data to play the audio
        }
      } else {
        console.log(event?.data);
        // Handle other types of messages such as strings
        setData(event.data);
        onMessageEvent(event.data);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bufferAudio, status],
  );

  /**
   * Opens Deepgram when the microphone opens.
   * Runs whenever `microphone` changes state, but exits if no microphone state.
   */
  useEffect(() => {
    console.log("Deepgram connect effect", {
      microphoneState,
      socketState,
      isInitialized,
      requiresUserActionToInitialize,
    });
    if (
      microphoneState === 1 &&
      (socketState === -1 || socketState === 3) &&
      (!requiresUserActionToInitialize ||
        (requiresUserActionToInitialize && isInitialized))
    ) {
      console.log("Calling connectToDeepgram from effect");
      connectToDeepgram();
    }
  }, [
    microphone,
    socket,
    microphoneState,
    socketState,
    isInitialized,
    requiresUserActionToInitialize,
  ]);

  /**
   * Sets up a WebSocket message event listener to handle incoming messages through the 'onMessage' callback.
   */
  useEffect(() => {
    if (socket) {
      socket.addEventListener("message", onMessage);
      return () => socket.removeEventListener("message", onMessage);
    }
  }, [socket, onMessage]);

  useEffect(() => {
    if (
      previousVoice &&
      previousVoice !== voice &&
      socket &&
      socketState === 1
    ) {
      sendSocketMessage(socket, {
        type: "UpdateSpeak",
        model: voice,
      });
    }
  }, [voice, socket, socketState, previousVoice]);

  const handleUpdateInstructions = useCallback(
    (instructions) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendSocketMessage(socket, {
          type: "UpdateInstructions",
          prompt: `${defaultStsConfig.agent.think.prompt}\n${instructions}`,
        });
      }
    },
    [socket, defaultStsConfig],
  );

  /**
   * Manage responses to incoming data from WebSocket.
   * This useEffect primarily handles string-based data that is expected to represent JSON-encoded messages determining actions based on the nature of the message
   * */
  useEffect(() => {
    /**
     * When the API returns a message event, several possible things can occur.
     *
     * 1. If it's a user message, check if it's a wake word or a stop word and add it to the queue.
     * 2. If it's an agent message, add it to the queue.
     * 3. If the message type is `AgentAudioDone` switch the app state to `START_LISTENING`
     */

    if (typeof data === "string") {
      const userRole = (data) => {
        const userTranscript = data.content;

        /**
         * When the user says something, add it to the conversation queue.
         */
        if (status !== VoiceBotStatus.SLEEPING) {
          addVoicebotMessage({ user: userTranscript });
        }

        setExchangeCount((count) => count + 1);
      };

      /**
       * When the assistant/agent says something, add it to the conversation queue.
       */
      const assistantRole = (data) => {
        if (
          status !== VoiceBotStatus.SLEEPING &&
          !isWaitingForUserVoiceAfterSleep.current
        ) {
          startSpeaking();
          const assistantTranscript = data.content;

          // Trigger spelling challenge if needed
          if (exchangeCount >= 2) {
            setShouldSpell(true);
            setExchangeCount(0);
            // Modify assistantTranscript to include a spelling challenge
            // Example: assistantTranscript += " Can you spell 'adventure' for me?";
          } else {
            setShouldSpell(false);
          }

          addVoicebotMessage({ assistant: assistantTranscript });
        }
      };

      try {
        const parsedData = JSON.parse(data);

        /**
         * Nothing was parsed so return an error.
         */
        if (!parsedData) {
          throw new Error("No data returned in JSON.");
        }

        maybeRecordBehindTheScenesEvent(parsedData);

        /**
         * If it's a user message.
         */
        if (parsedData.role === "user") {
          startListening();
          userRole(parsedData);
        }

        /**
         * If it's an agent message.
         */
        if (parsedData.role === "assistant") {
          if (status !== VoiceBotStatus.SLEEPING) {
            startSpeaking();
          }
          assistantRole(parsedData);
        }

        /**
         * The agent has finished speaking so we reset the sleep timer.
         */
        if (parsedData.type === EventType.AGENT_AUDIO_DONE) {
          // Note: It's not quite correct that the agent goes to the listening state upon receiving
          // `AgentAudioDone`. When that message is sent, it just means that all of the agent's
          // audio has arrived at the client, but the client will still be in the process of playing
          // it, which means the agent is still speaking. In practice, with the way the server
          // currently sends audio, this means Talon will deem the agent speech finished right when
          // the agent begins speaking the final sentence of its reply.
          startListening();
        }
        if (parsedData.type === EventType.USER_STARTED_SPEAKING) {
          isWaitingForUserVoiceAfterSleep.current = false;
          startListening();
          clearAudioBuffer();
        }
        if (parsedData.type === EventType.AGENT_STARTED_SPEAKING) {
          const { tts_latency, ttt_latency, total_latency } = parsedData;
          if (!tts_latency || !ttt_latency) return;
          const latencyMessage = { tts_latency, ttt_latency, total_latency };
          addVoicebotMessage(latencyMessage);
        }
      } catch (error) {
        console.error(data, error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, socket]);

  const handleVoiceBotAction = () => {
    if (requiresUserActionToInitialize && !isInitialized) {
      setIsInitialized(true);
    }

    if (status !== VoiceBotStatus.NONE) {
      toggleSleep();
    }
  };

  const maybeRecordBehindTheScenesEvent = (serverMsg) => {
    switch (serverMsg.type) {
      case EventType.SETTINGS_APPLIED:
        addBehindTheScenesEvent({
          type: EventType.SETTINGS_APPLIED,
        });
        break;
      case EventType.USER_STARTED_SPEAKING:
        if (status === VoiceBotStatus.SPEAKING) {
          addBehindTheScenesEvent({
            type: "Interruption",
          });
        }
        addBehindTheScenesEvent({
          type: EventType.USER_STARTED_SPEAKING,
        });
        break;
      case EventType.AGENT_STARTED_SPEAKING:
        addBehindTheScenesEvent({
          type: EventType.AGENT_STARTED_SPEAKING,
        });
        break;
      case EventType.CONVERSATION_TEXT: {
        const role = serverMsg.role;
        const content = serverMsg.content;
        addBehindTheScenesEvent({
          type: EventType.CONVERSATION_TEXT,
          role: role,
          content: content,
        });
        break;
      }
      case EventType.END_OF_THOUGHT:
        addBehindTheScenesEvent({
          type: EventType.END_OF_THOUGHT,
        });
        break;
    }
  };

  const handleInitialize = async () => {
    if (!isInitialized) {
      try {
        setIsInitialized(true);

        // Create or resume the AudioContext within a user gesture
        if (!microphoneAudioContext) {
          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          await audioContext.resume(); // Ensure the AudioContext is running
          console.log("AudioContext resumed");
          setMicrophoneAudioContext(audioContext);
        } else if (microphoneAudioContext.state === "suspended") {
          await microphoneAudioContext.resume();
          console.log("AudioContext resumed");
        }

        // Request microphone access
        console.log("Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        console.log("Microphone access granted");

        // Call setupMicrophone to complete the setup
        await setupMicrophone();

        // Connect to Deepgram
        console.log("Connecting to Deepgram...");
        connectToDeepgram();
      } catch (error) {
        console.error("Failed to initialize:", error);
        setIsInitialized(false); // Reset if failed
        alert(
          "Failed to access the microphone. Please allow microphone access and try again.",
        );
      }
    }
  };

  if (requiresUserActionToInitialize && !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <button
          onClick={handleInitialize}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
        >
          Allow Microphone Access
        </button>
        <p className="text-sm text-gray-600 text-center max-w-xs">
          Click to allow microphone access and start the voice assistant.
        </p>
      </div>
    );
  }

  if (rateLimited) {
    return <RateLimited />;
  }

  // MAIN UI
  return (
    <div className="inset-0 flex flex-col overflow-hidden">
      {/* Fixed BookTitle */}
      <div className="flex-none">
        <BookTitle
          book={selectedBook}
          onBack={() => {
            if (typeof disconnectFromDeepgram === "function") {
              disconnectFromDeepgram();
            }
            if (microphoneAudioContext) {
              microphoneAudioContext.close();
            }
            if (typeof onNavigate === "function") {
              onNavigate("library");
            }
          }}
        />
      </div>

      {/* Scrollable transcript area - absolute positioning to control exact boundaries */}
      <div
        className="absolute left-0 right-0 overflow-y-auto overflow-x-hidden"
        style={{
          top: "92px", // height of BookTitle
          bottom: "176px", // height of AnimationManager (80px) + BottomNavBar (64px)
        }}
      >
        {requiresUserActionToInitialize && !isInitialized ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <button
              onClick={handleInitialize}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
            >
              Allow Microphone Access
            </button>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              Click to allow microphone access and start the voice assistant.
            </p>
          </div>
        ) : rateLimited ? (
          <RateLimited />
        ) : (
          <Fragment>
            <Transcript userName={userName} />
          </Fragment>
        )}
      </div>

      {/* AnimationManager positioned above BottomNavBar */}
      <div className="absolute left-0 right-0 bottom-20">
        <Suspense fallback={<div>Loading...</div>}>
          <AnimationManager
            agentVoiceAnalyser={agentVoiceAnalyser.current}
            userVoiceAnalyser={userVoiceAnalyser.current}
            onOrbClick={toggleSleep}
            style={{ pointerEvents: "auto" }} // Enable pointer events for the orb
          />
          {!microphone ? (
            <div className="text-base text-gray-400 text-center w-full">
              {isInitialized
                ? "Setting up microphone..."
                : "Waiting for microphone access..."}
            </div>
          ) : (
            <Fragment>
              {socketState === 0 && (
                <div className="text-base text-gray-400 text-center w-full">
                  Loading Deepgram...
                </div>
              )}
              {socketState > 0 && status === VoiceBotStatus.SLEEPING && (
                <div className="text-xl flex flex-col items-center justify-center">
                  <div className="text-gray-400 text-sm">
                    I've stopped listening. {isMobile ? "Tap" : "Click"} the orb
                    to resume.
                  </div>
                </div>
              )}
            </Fragment>
          )}
        </Suspense>
      </div>
    </div>
  );
};
