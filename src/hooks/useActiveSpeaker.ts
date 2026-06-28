import { useState, useEffect } from "react";
import type { RefObject } from "react";

export type Utterance = {
  line_number: number;
  speaker: string;
  text: string;
  start_ms: number;
  end_ms: number;
  duration_ms: number;
};

function findActiveUtterance(
  script: Utterance[],
  ms: number,
): Utterance | null {
  let lo = 0,
    hi = script.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const u = script[mid];
    if (ms < u.start_ms) hi = mid - 1;
    else if (ms > u.end_ms) lo = mid + 1;
    else return u;
  }
  return null;
}

export function useActiveSpeaker(
  script: Utterance[],
  audioRef: RefObject<HTMLAudioElement | null>,
): string | null {
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || script.length === 0) return;

    const onTimeUpdate = () => {
      const ms = audio.currentTime * 1000;
      const utterance = findActiveUtterance(script, ms);
      setActiveSpeaker((prev) => {
        const next = utterance?.speaker ?? null;
        return next !== prev ? next : prev;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [script, audioRef]);

  return activeSpeaker;
}
