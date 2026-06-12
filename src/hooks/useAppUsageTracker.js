import { useCallback, useRef } from "react";

import { supabase } from "./integrations/supabase/client";

const APP_USAGE_TABLE = "app_usage_events";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const sanitizePayload = (payload) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
};

export const useAppUsageTracker = ({
  studentId = "",
  userName = "",
  transportType = "",
}) => {
  const sessionIdRef = useRef(createSessionId());
  const openTrackedRef = useRef(false);
  const seenSectionsRef = useRef(new Set());
  const lifecycleEventKeysRef = useRef(new Set());

  const buildPayload = useCallback(
    (eventType, details = {}) => {
      const metadata = {
        ...(details.metadata ?? {}),
      };
      if (userName) {
        metadata.user_name = userName;
      }
      if (transportType) {
        metadata.transport_type = transportType;
      }
      if (details.userAgent && !metadata.user_agent) {
        metadata.user_agent = details.userAgent;
      }
      if (details.referrer && !metadata.referrer) {
        metadata.referrer = details.referrer;
      }

      return sanitizePayload({
        session_id: sessionIdRef.current,
        student_id: studentId || null,
        event_type: eventType,
        section: details.section ?? null,
        book_id: details.bookId ?? null,
        chapter:
          details.chapter === null || details.chapter === undefined
            ? null
            : String(details.chapter),
        dot_title: details.dotTitle ?? null,
        conversation_id: details.conversationId ?? null,
        metadata,
      });
    },
    [studentId, transportType, userName],
  );

  const trackEvent = useCallback(
    async (eventType, details = {}) => {
      try {
        const payload = buildPayload(eventType, details);
        const { error } = await supabase.from(APP_USAGE_TABLE).insert(payload);
        if (error) {
          console.warn(`Failed to track ${eventType}:`, error);
        }
      } catch (error) {
        console.warn(`Failed to track ${eventType}:`, error);
      }
    },
    [buildPayload],
  );

  const trackLifecycleEvent = useCallback(
    (eventType, details = {}) => {
      try {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
        const lifecycleKey = JSON.stringify([
          eventType,
          details.section ?? "",
          details.bookId ?? "",
          details.chapter ?? "",
          details.dotTitle ?? "",
          details.conversationId ?? "",
        ]);
        if (lifecycleEventKeysRef.current.has(lifecycleKey)) return;
        lifecycleEventKeysRef.current.add(lifecycleKey);
        const payload = buildPayload(eventType, details);
        void fetch(`${SUPABASE_URL}/rest/v1/${APP_USAGE_TABLE}`, {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.warn(`Failed to track lifecycle ${eventType}:`, error);
      }
    },
    [buildPayload],
  );

  const trackAppOpen = useCallback(
    async (details = {}) => {
      if (openTrackedRef.current) return;
      openTrackedRef.current = true;
      await trackEvent("app_open", details);
    },
    [trackEvent],
  );

  const trackSectionView = useCallback(
    async (section, details = {}) => {
      if (!section) return;
      if (seenSectionsRef.current.has(section)) return;
      seenSectionsRef.current.add(section);
      await trackEvent("section_view", { ...details, section });
    },
    [trackEvent],
  );

  return {
    sessionId: sessionIdRef.current,
    trackAppOpen,
    trackEvent,
    trackLifecycleEvent,
    trackSectionView,
  };
};
