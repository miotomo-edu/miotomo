import React, { useRef, useEffect } from "react";

export function useConversationPersistence({
  conversationConfig,
  messages,
  messageCount,
  createConversation,
  updateConversation,
  onSessionIdChange,
  debounceMs = 2000,
}) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedMessageCount = useRef(0);
  const sessionConversationId = useRef<string | null>(null);
  const isCurrentlySaving = useRef(false);

  const [conversationSaving, setConversationSaving] = React.useState(false);
  const [conversationSaveError, setConversationSaveError] = React.useState<
    string | null
  >(null);

  // Reset session when config changes
  useEffect(() => {
    sessionConversationId.current = null;
    lastSavedMessageCount.current = 0;
    isCurrentlySaving.current = false;
    setConversationSaveError(null);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (onSessionIdChange) onSessionIdChange(null);
  }, [
    conversationConfig.studentId,
    conversationConfig.bookId,
    conversationConfig.autoSave,
  ]);

  useEffect(() => {
    if (
      !conversationConfig.autoSave ||
      !conversationConfig.studentId ||
      !conversationConfig.bookId ||
      messages.length === 0 ||
      messageCount === lastSavedMessageCount.current ||
      isCurrentlySaving.current
    ) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (isCurrentlySaving.current) return;
      setConversationSaving(true);
      isCurrentlySaving.current = true;
      setConversationSaveError(null);

      try {
        if (sessionConversationId.current) {
          const result = await updateConversation(
            sessionConversationId.current,
            messages,
          );
          if (result.error) {
            setConversationSaveError(result.error);
          } else {
            lastSavedMessageCount.current = messageCount;
          }
        } else {
          const result = await createConversation(
            conversationConfig.studentId!,
            conversationConfig.bookId!,
            messages,
          );
          if (result.error) {
            setConversationSaveError(result.error);
          } else {
            sessionConversationId.current = result.conversationId || null;
            lastSavedMessageCount.current = messageCount;
            if (onSessionIdChange)
              onSessionIdChange(sessionConversationId.current);
          }
        }
      } catch (err) {
        setConversationSaveError(String(err));
      } finally {
        setConversationSaving(false);
        isCurrentlySaving.current = false;
      }
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    conversationConfig,
    messages,
    messageCount,
    createConversation,
    updateConversation,
    debounceMs,
    onSessionIdChange,
  ]);

  // Expose a reset function for session
  const resetSession = () => {
    sessionConversationId.current = null;
    lastSavedMessageCount.current = 0;
    isCurrentlySaving.current = false;
    setConversationSaveError(null);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (onSessionIdChange) onSessionIdChange(null);
  };

  return {
    conversationSaving,
    conversationSaveError,
    resetSession,
    sessionConversationId: sessionConversationId.current,
  };
}
