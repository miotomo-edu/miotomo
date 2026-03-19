// hooks/useProgress.ts
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const NO_ROWS_ERROR_CODE = "PGRST116";

const fetchLatestPreviousProgress = async (conversationId: string) => {
  const [{ data: metricsRows, error: metricsRowsErr }, { data: utteranceRows, error: utteranceRowsErr }] =
    await Promise.all([
      supabase
        .from("metrics")
        .select("*")
        .neq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("utterances")
        .select("*")
        .neq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  if (metricsRowsErr) throw metricsRowsErr;
  if (utteranceRowsErr) throw utteranceRowsErr;

  const metricsByConversation = new Map(
    (metricsRows ?? [])
      .filter((row) => row?.conversation_id)
      .map((row) => [row.conversation_id, row]),
  );
  const utterancesByConversation = new Map(
    (utteranceRows ?? [])
      .filter((row) => row?.conversation_id)
      .map((row) => [row.conversation_id, row]),
  );

  const fallbackConversationId = (metricsRows ?? []).find(
    (row) =>
      row?.conversation_id && utterancesByConversation.has(row.conversation_id),
  )?.conversation_id;

  if (!fallbackConversationId) {
    return null;
  }

  return {
    metrics: metricsByConversation.get(fallbackConversationId) ?? null,
    utterances: utterancesByConversation.get(fallbackConversationId) ?? null,
  };
};

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
        const [{ data: metrics, error: metricsErr }, { data: utterances, error: uttErr }] =
          await Promise.all([
            supabase
              .from("metrics")
              .select("*")
              .eq("conversation_id", conversationId)
              .maybeSingle(),
            supabase
              .from("utterances")
              .select("*")
              .eq("conversation_id", conversationId)
              .maybeSingle(),
          ]);

        if (metricsErr && metricsErr.code !== NO_ROWS_ERROR_CODE) throw metricsErr;
        if (uttErr && uttErr.code !== NO_ROWS_ERROR_CODE) throw uttErr;

        if (!metrics || !utterances) {
          const fallback = await fetchLatestPreviousProgress(conversationId);
          if (fallback?.metrics && fallback?.utterances) {
            if (isMounted) {
              setStatus({
                metrics: fallback.metrics.status ?? "done",
                utterances: fallback.utterances.status ?? "done",
              });
              setData(fallback);
              setError(null);
              setLoading(false);
            }
            return;
          }
        }

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
