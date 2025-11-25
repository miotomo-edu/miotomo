import { useEffect, useRef } from "react";
import { usePipecatClientMediaTrack } from "@pipecat-ai/client-react";

interface BotAudioProps {
  volume?: number; // 0 to 1
  playbackRate?: number; // 0.5 to 2.0 (or higher)
}

const BotAudio = ({ volume = 1, playbackRate = 1.0 }: BotAudioProps) => {
  const botAudioTrack = usePipecatClientMediaTrack("audio", "bot");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (botAudioTrack) {
      const stream = new MediaStream([botAudioTrack]);

      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      // Create source from the stream
      sourceRef.current = audioContext.createMediaStreamSource(stream);

      // Create a destination that we can connect to an audio element
      const destination = audioContext.createMediaStreamDestination();

      // For better quality pitch shifting, we can use playbackRate on the audio element
      audioRef.current.srcObject = stream;
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.preservesPitch = false; // This makes pitch change with speed

      const playAudio = async () => {
        try {
          await audioRef.current?.play();
        } catch (err) {
          console.warn("Bot audio playback interrupted", err);
        }
      };
      playAudio();
    } else {
      audioRef.current.srcObject = null;
    }

    // Cleanup
    return () => {
      if (audioRef.current?.srcObject) {
        const stream = audioRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        audioRef.current.srcObject = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
    };
  }, [botAudioTrack, volume, playbackRate]);

  return <audio ref={audioRef} autoPlay />;
};

export default BotAudio;
