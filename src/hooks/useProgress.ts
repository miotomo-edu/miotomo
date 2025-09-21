import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { useConversations } from "./useConversations";

export function useProgress(
  conversationId: string | null,
  studentId: string,
  bookId: string,
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [localConversationId, setLocalConversationId] = useState<string | null>(
    conversationId,
  );

  const { getLastConversation } = useConversations();

  useEffect(() => {
    const fetchProgressData = async (convId: string) => {
      setLoading(true);
      try {
        const { data: metrics, error: metricsErr } = await supabase
          .from("metrics")
          .select("*")
          .eq("conversation_id", convId)
          .single();

        const { data: utterances, error: uttErr } = await supabase
          .from("utterances")
          .select("*")
          .eq("conversation_id", convId)
          .single();

        if (metricsErr) throw metricsErr;
        if (uttErr) throw uttErr;

        setData({ metrics, utterances });
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    // If we don't have a conversationId, fetch the last one
    if (!localConversationId) {
      const getConversation = async () => {
        setLoading(true);
        try {
          const result = await getLastConversation(studentId, bookId);
          if (result?.data?.id) {
            setLocalConversationId(result.data.id);
            // Now fetch the progress data for this conversation
            await fetchProgressData(result.data.id);
          } else {
            setError(new Error("No conversation found"));
            setLoading(false);
          }
        } catch (e) {
          setError(e);
          setLoading(false);
        }
      };
      getConversation();
    } else {
      // If we already have a conversationId, fetch progress data directly
      fetchProgressData(localConversationId);
    }
  }, [localConversationId, studentId, bookId]);

  return { data, loading, error };
}
