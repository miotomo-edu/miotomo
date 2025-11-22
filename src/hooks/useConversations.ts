import { useState, useCallback } from "react";
import { supabase } from "./integrations/supabase/client";

export interface ConversationData {
  id?: string;
  student_id: string;
  book_id: string;
  created_at?: string;
  updated_at?: string;
  env: string;
  modalities?: string | null;
  status?: string | null;
  elapsed_seconds?: number;
  day?: string;
  last_active_at?: string;
  stage_state?: unknown;
  context_summary?: unknown;
  session_count?: number;
}

export interface UseConversationsReturn {
  getConversations: (
    studentId?: string,
    bookId?: string,
  ) => Promise<{ data: any; error: any }>;
  getConversationById: (
    conversationId: string,
  ) => Promise<{ data: any; error: any }>;
  deleteConversation: (
    conversationId: string,
  ) => Promise<{ data: any; error: any }>;
  loading: boolean;
  error: string | null;
}

export const useConversations = (): UseConversationsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getConversations = useCallback(
    async (studentId?: string, bookId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const tableName = "conversations";

        let query = supabase
          .from(tableName)
          .select(
            "id, created_at, updated_at, day, last_active_at, status, elapsed_seconds, book_id, student_id",
          )
          .order("created_at", { ascending: false });

        if (studentId) {
          query = query.eq("student_id", studentId);
        }

        if (bookId) {
          query = query.eq("book_id", bookId);
        }

        const today = new Date().toISOString().slice(0, 10);
        query = query.eq("day", today);

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching conversations:", error);
          setError(error.message);
          return { data: [], error }; // Return empty array instead of null
        }

        return { data: data || [], error: null };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error fetching conversations:", err);
        setError(errorMessage);
        return { data: [], error: err }; // Return empty array instead of null
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getConversationById = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      console.warn("Missing conversation ID");
      return { data: null, error: null };
    }

    setLoading(true);
    setError(null);

    try {
      const tableName = "conversations";

      const { data, error } = await supabase
        .from(tableName)
        .select(
          "id, created_at, updated_at, day, last_active_at, status, elapsed_seconds, book_id, student_id",
        )
        .eq("id", conversationId)
        .single();

      if (error) {
        console.error("Error fetching conversation:", error);
        setError(error.message);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error fetching conversation:", err);
      setError(errorMessage);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      console.warn("Missing conversation ID for deletion");
      return { data: null, error: null };
    }

    setLoading(true);
    setError(null);

    try {
      const tableName = "conversations";

      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", conversationId);

      if (error) {
        console.error("Error deleting conversation:", error);
        setError(error.message);
        return { data: null, error };
      }

      console.log("Conversation deleted successfully");
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error deleting conversation:", err);
      setError(errorMessage);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getConversations,
    getConversationById,
    deleteConversation,
    loading,
    error,
  };
};
