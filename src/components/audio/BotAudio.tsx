import { useEffect, useRef } from "react";
import { usePipecatClientMediaTrack } from "@pipecat-ai/client-react";

interface BotAudioProps {
  volume?: number;
  playbackRate?: number;
  muted?: boolean;
}

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const BotAudio: React.FC<BotAudioProps> = ({
  volume = 1,
  playbackRate = 1,
  muted = false,
}) => {
  const botAudioTrack = usePipecatClientMediaTrack("audio", "bot");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTrackIdRef = useRef<string | null>(null);
  const needsUnlockRef = useRef(false);

  const attemptPlay = (audio: HTMLAudioElement) => {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((err) => {
        const name = err?.name || "";
        const message = err?.message || "";
        if (
          name === "AbortError" ||
          message.includes("interrupted by a call to pause")
        ) {
          return;
        }
        if (name === "NotAllowedError") {
          needsUnlockRef.current = true;
          return;
        }
        console.warn("Bot audio playback interrupted", err);
      });
    }
  };

  useEffect(() => {
    const handleUnlock = () => {
      if (!needsUnlockRef.current) return;
      const audio = audioRef.current;
      if (!audio) return;
      needsUnlockRef.current = false;
      attemptPlay(audio);
    };
    window.addEventListener("pointerdown", handleUnlock);
    window.addEventListener("keydown", handleUnlock);
    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = clampValue(volume, 0, 1);
    audio.playbackRate = clampValue(playbackRate, 0.5, 2);
    if (!muted && audio.srcObject && audio.paused) {
      attemptPlay(audio);
    }
  }, [muted, volume, playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!botAudioTrack) {
      audio.srcObject = null;
      lastTrackIdRef.current = null;
      return;
    }

    const existingTrack = audio.srcObject?.getAudioTracks?.()?.[0];
    if (existingTrack?.id === botAudioTrack.id) {
      return;
    }

    audio.srcObject = new MediaStream([botAudioTrack]);
    lastTrackIdRef.current = botAudioTrack.id;
    attemptPlay(audio);
  }, [botAudioTrack]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      audio.srcObject = null;
      lastTrackIdRef.current = null;
    };
  }, []);

  return <audio ref={audioRef} autoPlay muted={muted} />;
};

export default BotAudio;
