// hooks/useProgress.ts
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

export function useProgress(conversationId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [status, setStatus] = useState<{ metrics: string | null; utterances: string | null }>({
    metrics: null,
    utterances: null,
  });

  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;
    let retryTimeout: number | null = null;

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

        const metricsStatus = metrics?.status ?? null;
        const utterancesStatus = utterances?.status ?? null;

        if (isMounted) {
          setStatus({ metrics: metricsStatus, utterances: utterancesStatus });
        }

        const isReady = metricsStatus === "done" && utterancesStatus === "done";

        if (isReady) {
          if (isMounted) {
            setData({ metrics, utterances });
            setLoading(false);
          }
        } else if (isMounted) {
          setData(null);
          setLoading(true);
          retryTimeout = window.setTimeout(fetchData, 2000);
        }
      } catch (e) {
        if (isMounted) {
          setError(e);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [conversationId]);

  return { data, loading, error, status };
}
