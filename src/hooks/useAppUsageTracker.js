import { useCallback, useRef } from "react";

import {
  useSupabaseUserData,
  useUserDataSupabaseConfig,
} from "./integrations/supabase/userDataRegion";

const APP_USAGE_TABLE = "app_usage_events";
const APP_USAGE_TRACKING_DISABLED =
  import.meta.env.VITE_DISABLE_APP_USAGE_TRACKING === "1" ||
  import.meta.env.VITE_DISABLE_APP_USAGE_TRACKING === "true";

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

const getCurrentUrl = () => {
  if (typeof window === "undefined") return null;
  return window.location?.href || null;
};

export const useAppUsageTracker = ({
  studentId = "",
  userName = "",
  transportType = "",
}) => {
  const supabaseUserData = useSupabaseUserData();
  const { url: userDataSupabaseUrl, anonKey: userDataSupabaseAnonKey } =
    useUserDataSupabaseConfig();
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
      if (!metadata.url) {
        metadata.url = getCurrentUrl();
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
      if (APP_USAGE_TRACKING_DISABLED) return;
      try {
        const payload = buildPayload(eventType, details);
        const { error } = await supabaseUserData
          .from(APP_USAGE_TABLE)
          .insert(payload);
        if (error) {
          console.warn(`Failed to track ${eventType}:`, error);
        }
      } catch (error) {
        console.warn(`Failed to track ${eventType}:`, error);
      }
    },
    [buildPayload, supabaseUserData],
  );

  const trackLifecycleEvent = useCallback(
    (eventType, details = {}) => {
      if (APP_USAGE_TRACKING_DISABLED) return;
      try {
        if (!userDataSupabaseUrl || !userDataSupabaseAnonKey) return;
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
        void fetch(`${userDataSupabaseUrl}/rest/v1/${APP_USAGE_TABLE}`, {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            "Content-Profile": "user_data",
            apikey: userDataSupabaseAnonKey,
            Authorization: `Bearer ${userDataSupabaseAnonKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.warn(`Failed to track lifecycle ${eventType}:`, error);
      }
    },
    [buildPayload, userDataSupabaseAnonKey, userDataSupabaseUrl],
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
