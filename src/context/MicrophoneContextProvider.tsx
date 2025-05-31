import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
} from "react";

interface MicrophoneContextType {
  microphone: MediaStreamAudioSourceNode | undefined;
  startMicrophone: () => void;
  setupMicrophone: () => Promise<void>;
  microphoneState: number | null;
  microphoneAudioContext: AudioContext | undefined;
  setMicrophoneAudioContext: (context: AudioContext) => void;
  processor: ScriptProcessorNode | undefined;
  cleanupMicrophone: () => void;
}

const MicrophoneContext = createContext<MicrophoneContextType | undefined>(
  undefined,
);

const MicrophoneContextProvider = ({ children }: { children: ReactNode }) => {
  const [microphoneState, setMicrophoneState] = useState<number | null>(null);
  const [microphone, setMicrophone] = useState<MediaStreamAudioSourceNode>();
  const [microphoneAudioContext, setMicrophoneAudioContext] =
    useState<AudioContext>();
  const [processor, setProcessor] = useState<ScriptProcessorNode>();
  const mediaStreamRef = useRef<MediaStream | undefined>();
  const audioContextRef = useRef<AudioContext | undefined>();

  const setupMicrophone = async () => {
    console.log("Setting up microphone...");
    setMicrophoneState(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false,
        },
      });

      mediaStreamRef.current = stream;

      console.log("Got microphone stream");

      const audioContext = microphoneAudioContext || new AudioContext();
      await audioContext.resume();

      audioContextRef.current = audioContext;

      const microphone = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      setMicrophone(microphone);
      setMicrophoneAudioContext(audioContext);
      setProcessor(processor);
      setMicrophoneState(1);
      console.log("Microphone setup complete - state:", 1);
    } catch (err) {
      console.error("Microphone setup error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          alert("Please allow microphone access to use the voice features.");
        } else if (err.name === "NotFoundError") {
          alert(
            "No microphone found. Please connect a microphone and try again.",
          );
        } else {
          alert("An unknown error occurred while accessing the microphone.");
        }
      }
      setMicrophoneState(null);
    }
  };

  const startMicrophone = () => {
    console.log("startMicrophone called with:", {
      microphone,
      processor,
      microphoneAudioContext,
    });
    if (!microphone || !processor || !microphoneAudioContext) {
      console.log("Missing dependency:", {
        microphone,
        processor,
        microphoneAudioContext,
      });
      return;
    }

    try {
      microphone.connect(processor);
      processor.connect(microphoneAudioContext.destination);

      setTimeout(() => {
        console.log("setMicrophoneState(2)!!!!");
        setMicrophoneState(2);
      }, 100);
    } catch (err) {
      console.error("Error starting microphone:", err);
    }
  };

  // Stable cleanup function
  const cleanupMicrophone = () => {
    try {
      microphone?.disconnect();
    } catch {}
    try {
      processor?.disconnect();
    } catch {}

    if (mediaStreamRef.current) {
      console.log("TRACKS", mediaStreamRef.current.getTracks());
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = undefined;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = undefined;
    }
    setMicrophone(undefined);
    setProcessor(undefined);
    setMicrophoneAudioContext(undefined);
    setMicrophoneState(null);
    console.log("Microphone cleaned up");
  };

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        startMicrophone,
        setupMicrophone,
        microphoneState,
        microphoneAudioContext,
        setMicrophoneAudioContext,
        processor,
        cleanupMicrophone,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

function useMicrophone(): MicrophoneContextType {
  const context = useContext(MicrophoneContext);
  if (context === undefined) {
    throw new Error(
      "useMicrophone must be used within a MicrophoneContextProvider",
    );
  }
  return context;
}

export { MicrophoneContextProvider, useMicrophone };
