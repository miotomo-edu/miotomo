import { useEffect, useRef } from "react";
import { usePipecatClientMediaTrack } from "@pipecat-ai/client-react";

interface BotAudioProps {
  volume?: number;
  playbackRate?: number;
}

const BotAudio: React.FC<BotAudioProps> = ({
  volume = 1,
  playbackRate = 1,
}) => {
  const botAudioTrack = usePipecatClientMediaTrack("audio", "bot");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (botAudioTrack) {
      audioRef.current.srcObject = new MediaStream([botAudioTrack]);
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

    return () => {
      if (audioRef.current?.srcObject) {
        const stream = audioRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        audioRef.current.srcObject = null;
      }
    };
  }, [botAudioTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(Math.max(volume, 0), 1);
      audioRef.current.playbackRate = Math.min(
        Math.max(playbackRate, 0.5),
        2,
      );
    }
  }, [volume, playbackRate]);

  return <audio ref={audioRef} autoPlay muted={false} />;
};

export default BotAudio;
