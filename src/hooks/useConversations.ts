import { useState, useCallback } from "react";
import { supabase } from "./integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "./integrations/supabase/types";
import type {
  VoiceBotMessage,
  ConversationMessage,
} from "../context/VoiceBotContextProvider";
import { isConversationMessage } from "../context/VoiceBotContextProvider";

export interface ConversationData {
  id?: string;
  student_id: string;
  book_id: string;
  messages: ConversationMessage[];
  created_at?: string;
  updated_at?: string;
  env: string;
}

export interface UseConversationsReturn {
  createConversation: (
    studentId: string,
    bookId: string,
    messages: VoiceBotMessage[],
  ) => Promise<{ data: any; error: any; conversationId?: string }>;
  updateConversation: (
    conversationId: string,
    messages: VoiceBotMessage[],
  ) => Promise<{ data: any; error: any }>;
  getConversations: (
    studentId?: string,
    bookId?: string | null,
  ) => Promise<{ data: any; error: any }>;
  getLastConversation: (
    studentId?: string,
    bookId?: string | null,
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

  const createConversation = useCallback(
    async (studentId: string, bookId: string, messages: VoiceBotMessage[]) => {
      // Fail silently if required parameters are missing
      if (!studentId || !bookId) {
        console.warn("Missing required parameters for conversation creation");
        return { data: null, error: null, conversationId: null };
      }

      setLoading(true);
      setError(null);

      try {
        // Safely filter messages
        const conversationMessages = Array.isArray(messages)
          ? messages.filter((msg) => {
              try {
                return isConversationMessage(msg);
              } catch (e) {
                console.warn("Error filtering message:", e);
                return false;
              }
            })
          : [];

        // Don't create empty conversations
        if (conversationMessages.length === 0) {
          console.log("No valid messages to save");
          return { data: null, error: null, conversationId: null };
        }

        const conversationData: TablesInsert<"conversations"> = {
          student_id: studentId,
          book_id: bookId,
          messages: conversationMessages,
          env: window.location.hostname === "localhost" ? "dev" : "prod",
        };

        const tableName = "conversations";

        const { data, error } = await supabase
          .from(tableName)
          .insert(conversationData)
          .select();

        if (error) {
          console.error("Error creating conversation:", error);
          setError(error.message);
          // Return null but don't throw - let the app continue
          return { data: null, error, conversationId: null };
        }

        const conversationId = data?.[0]?.id || null;
        console.log("Conversation created successfully:", conversationId);
        return { data, error: null, conversationId };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error creating conversation:", err);
        setError(errorMessage);
        // Return null but don't throw - let the app continue
        return { data: null, error: err, conversationId: null };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateConversation = useCallback(
    async (conversationId: string, messages: VoiceBotMessage[]) => {
      // Fail silently if required parameters are missing
      if (!conversationId) {
        console.warn("Missing conversation ID for update");
        return { data: null, error: null };
      }

      setLoading(true);
      setError(null);

      try {
        // Safely filter messages
        const conversationMessages = Array.isArray(messages)
          ? messages.filter((msg) => {
              try {
                return isConversationMessage(msg);
              } catch (e) {
                console.warn("Error filtering message:", e);
                return false;
              }
            })
          : [];

        // Don't update with empty conversations
        if (conversationMessages.length === 0) {
          console.log("No valid messages to update");
          return { data: null, error: null };
        }

        const updateData: TablesUpdate<"conversations"> = {
          messages: conversationMessages,
        };

        const tableName = "conversations";

        const { data, error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq("id", conversationId)
          .select();

        if (error) {
          console.error("Error updating conversation:", error);
          setError(error.message);
          // Return null but don't throw - let the app continue
          return { data: null, error };
        }

        console.log("Conversation updated successfully");
        return { data, error: null };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error updating conversation:", err);
        setError(errorMessage);
        // Return null but don't throw - let the app continue
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getConversations = useCallback(
    async (studentId?: string, bookId?: string | null) => {
      setLoading(true);
      setError(null);

      try {
        const tableName = "conversations";

        let query = supabase
          .from(tableName)
          .select(
            `
            *,
            students(name, avatar),
            books(title, author, cover)
          `,
          )
          .order("created_at", { ascending: false });

        if (studentId) {
          query = query.eq("student_id", studentId);
        }

        if (bookId) {
          query = query.eq("book_id", bookId);
        }

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

  const getLastConversation = useCallback(
    async (studentId?: string, bookId?: string | null) => {
      setLoading(true);
      setError(null);

      try {
        const tableName = "conversations";

        let query = supabase
          .from(tableName)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (studentId) {
          query = query.eq("student_id", studentId);
        }

        // Only filter by bookId if it's a truthy string value
        if (bookId) {
          query = query.eq("book_id", bookId);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching last conversation:", error);
          setError(error.message);
          return { data: null, error };
        }

        // Return the first (and only) item or null if no conversations found
        return { data: data?.[0] || null, error: null };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error fetching last conversation:", err);
        setError(errorMessage);
        return { data: null, error: err };
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
          `
          *,
          students(name, avatar),
          books(title, author, cover)
        `,
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
    createConversation,
    updateConversation,
    getConversations,
    getLastConversation,
    getConversationById,
    deleteConversation,
    loading,
    error,
  };
};
