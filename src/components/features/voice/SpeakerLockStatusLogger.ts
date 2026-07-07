type SpeakerLockPayload = {
  type?: unknown;
  event_type?: unknown;
  eventType?: unknown;
  status?: unknown;
  data?: unknown;
};

const SPEAKER_LOCK_EVENT_TYPES = new Set([
  "speaker-lock-status",
  "speaker_lock_status",
  "speakerLockStatus",
]);

const SPEAKER_LOCK_STATUS_EMOJIS: Record<string, string> = {
  detecting: "🕵️",
  locked: "🔒",
  no_speaker_detected: "🔇",
  relocking: "🔁",
};

const isPayloadObject = (payload: unknown): payload is SpeakerLockPayload =>
  !!payload && typeof payload === "object";

const getEventType = (payload: SpeakerLockPayload) =>
  payload.type || payload.event_type || payload.eventType;

const extractSpeakerLockStatusEvent = (
  payload: unknown,
): SpeakerLockPayload | null => {
  if (!isPayloadObject(payload)) return null;
  if (SPEAKER_LOCK_EVENT_TYPES.has(String(getEventType(payload)))) {
    return payload;
  }

  if (isPayloadObject(payload.data) && payload.data !== payload) {
    return extractSpeakerLockStatusEvent(payload.data);
  }

  return null;
};

const getSpeakerLockStatus = (payload: SpeakerLockPayload): string => {
  if (typeof payload.status === "string") {
    return payload.status;
  }

  if (isPayloadObject(payload.data)) {
    return getSpeakerLockStatus(payload.data);
  }

  return "unknown";
};

export const logSpeakerLockStatusFromServerMessage = (
  payload: unknown,
): boolean => {
  const event = extractSpeakerLockStatusEvent(payload);
  if (!event) return false;

  const status = getSpeakerLockStatus(event);
  const emoji = SPEAKER_LOCK_STATUS_EMOJIS[status] || "🎙️";
  console.log(`${emoji} [RTVIEvent] SpeakerLockStatus: ${status}`, event);
  return true;
};
