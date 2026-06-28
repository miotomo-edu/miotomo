import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { useActiveSpeaker, type Utterance } from "@/hooks/useActiveSpeaker";
import CrossfadeVideo from "./CrossfadeVideo";

export type EpisodeVideoConfig = {
  clips: Record<string, string>;
  idleClip?: string;
};

type Props = {
  script: Utterance[];
  audioRef: RefObject<HTMLAudioElement | null>;
  config: EpisodeVideoConfig;
  paused?: boolean;
};

export default function EpisodeVideoPlayer({
  script,
  audioRef,
  config,
  paused = false,
}: Props) {
  const activeSpeaker = useActiveSpeaker(script, audioRef);
  const [src, setSrc] = useState<string | undefined>(
    config.idleClip ?? Object.values(config.clips)[0],
  );

  useEffect(() => {
    const nextSrc = activeSpeaker ? config.clips[activeSpeaker] : undefined;
    const availableClips = Object.values(config.clips);

    setSrc((currentSrc) => {
      if (nextSrc) return nextSrc;
      if (currentSrc && availableClips.includes(currentSrc)) return currentSrc;
      return config.idleClip ?? availableClips[0];
    });
  }, [activeSpeaker, config]);

  return <CrossfadeVideo src={src} paused={paused} />;
}
