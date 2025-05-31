import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
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
  const [mediaStream, setMediaStream] = useState<MediaStream>();

  const setupMicrophone = async () => {
    console.log("Setting up microphone...");
    setMicrophoneState(0);

    try {
      // Request microphone access directly
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false,
        },
      });

      setMediaStream(stream);

      console.log("Got microphone stream");

      // Use the existing AudioContext or create a new one
      const audioContext = microphoneAudioContext || new AudioContext();
      await audioContext.resume(); // Ensure the AudioContext is running

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

  const startMicrophone = useCallback(() => {
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
      // Make connections first
      microphone.connect(processor);
      processor.connect(microphoneAudioContext.destination);

      // Set state after successful connection
      setTimeout(() => {
        console.log("setMicrophoneState(2)!!!!");
        setMicrophoneState(2);
      }, 100); // Small delay to ensure connections are established
    } catch (err) {
      console.error("Error starting microphone:", err);
    }
  }, [processor, microphoneAudioContext, microphone]);

  // Cleanup function to stop all tracks and close the audio context
  const cleanupMicrophone = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (microphoneAudioContext) {
      microphoneAudioContext.close();
    }
    setMicrophone(undefined);
    setProcessor(undefined);
    setMicrophoneAudioContext(undefined);
    setMediaStream(undefined);
    setMicrophoneState(null);
    console.log("Microphone cleaned up");
  }, [mediaStream, microphoneAudioContext]);

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
