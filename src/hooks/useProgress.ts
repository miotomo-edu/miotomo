// hooks/useProgress.ts
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

export function useProgress(conversationId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: metrics, error: metricsErr } = await supabase
          .from("metrics")
          .select("*")
          .eq("conversation_id", conversationId)
          .single();

        const { data: utterances, error: uttErr } = await supabase
          .from("utterances")
          .select("*")
          .eq("conversation_id", conversationId)
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

    fetchData();
  }, [conversationId]);

  return { data, loading, error };
}
