import { useCallback, useState } from "react";

import { useSupabaseUserData } from "./integrations/supabase/userDataRegion";

const PARENTAL_CONSENTS_TABLE = "parental_consents";

const sanitizePayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );

export const useParentalConsent = () => {
  const supabaseUserData = useSupabaseUserData();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveConsent = useCallback(async (details) => {
    setSaving(true);
    setError("");

    try {
      const payload = sanitizePayload({
        student_id: details.studentId || null,
        child_name: details.childName,
        parent_name: details.parentName,
        consent_date: details.consentDate,
        consent_given: true,
        consented_at: new Date().toISOString(),
        consent_text_version: details.consentTextVersion || "v1",
        processors_disclosed: details.processorsDisclosed || [],
        user_agent: details.userAgent || null,
      });

      const { error: insertError } = await supabaseUserData
        .from(PARENTAL_CONSENTS_TABLE)
        .insert(payload);

      if (insertError) {
        throw insertError;
      }

      return { error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save consent.";
      setError(message);
      return { error: err };
    } finally {
      setSaving(false);
    }
  }, [supabaseUserData]);

  return {
    saveConsent,
    saving,
    error,
  };
};
