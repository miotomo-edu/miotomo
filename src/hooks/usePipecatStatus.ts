// src/hooks/usePipecatStatus.ts
import { useState } from "react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";

export enum PipecatStatus {
  NONE = "NONE",
  LISTENING = "LISTENING",
  SPEAKING = "SPEAKING",
}

export function usePipecatStatus() {
  const [status, setStatus] = useState<PipecatStatus>(PipecatStatus.NONE);

  useRTVIClientEvent(RTVIEvent.UserStartedSpeaking, () => {
    setStatus(PipecatStatus.LISTENING);
  });

  useRTVIClientEvent(RTVIEvent.UserStoppedSpeaking, () => {
    // don't immediately drop to NONE — keep short debounce in Pipecat events if needed;
    setStatus(PipecatStatus.NONE);
  });

  useRTVIClientEvent(RTVIEvent.BotStartedSpeaking, () => {
    setStatus(PipecatStatus.SPEAKING);
  });

  useRTVIClientEvent(RTVIEvent.BotStoppedSpeaking, () => {
    setStatus(PipecatStatus.NONE);
  });

  return { status };
}
