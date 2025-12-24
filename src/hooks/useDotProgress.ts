import { useCallback, useState } from "react";
import { supabase } from "./integrations/supabase/client";

export type DotProgressUpdate = {
  studentId: string;
  bookId: string;
  episode: number;
  listeningStatus?: "not_started" | "in_progress" | "paused" | "completed";
  talkingStatus?: "not_started" | "in_progress" | "paused" | "completed";
  elapsedListeningSeconds?: number;
  elapsedTalkingSeconds?: number;
  lastConversationId?: string | null;
  lastActiveAt?: string;
};

export const useDotProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDotProgress = useCallback(
    async (studentId: string, bookId: string, episode: number) => {
      if (!studentId || !bookId || !episode) {
        return { data: null, error: null };
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from("dot_progress")
          .select(
            "listening_status, talking_status, elapsed_listening_seconds, elapsed_talking_seconds",
          )
          .eq("student_id", studentId)
          .eq("book_id", bookId)
          .eq("episode", episode)
          .maybeSingle();

        if (supabaseError) {
          setError(supabaseError.message);
          console.warn("Failed to fetch dot progress:", supabaseError);
          return { data: null, error: supabaseError };
        }

        return { data, error: null };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.warn("Failed to fetch dot progress:", err);
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const upsertDotProgress = useCallback(async (update: DotProgressUpdate) => {
    if (!update.studentId || !update.bookId || !update.episode) {
      return { data: null, error: null };
    }

    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {
      student_id: update.studentId,
      book_id: update.bookId,
      episode: update.episode,
      last_active_at: update.lastActiveAt ?? new Date().toISOString(),
    };

    if (update.listeningStatus) {
      payload.listening_status = update.listeningStatus;
    }
    if (update.talkingStatus) {
      payload.talking_status = update.talkingStatus;
    }
    if (typeof update.elapsedListeningSeconds === "number") {
      payload.elapsed_listening_seconds = Math.max(
        0,
        Math.floor(update.elapsedListeningSeconds),
      );
    }
    if (typeof update.elapsedTalkingSeconds === "number") {
      payload.elapsed_talking_seconds = Math.max(
        0,
        Math.floor(update.elapsedTalkingSeconds),
      );
    }
    if (update.lastConversationId !== undefined) {
      payload.last_conversation_id = update.lastConversationId;
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from("dot_progress")
        .upsert(payload, {
          onConflict: "student_id,book_id,episode",
        });

      if (supabaseError) {
        setError(supabaseError.message);
        console.warn("Failed to update dot progress:", supabaseError);
        return { data: null, error: supabaseError };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.warn("Failed to update dot progress:", err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { upsertDotProgress, getDotProgress, loading, error };
};
