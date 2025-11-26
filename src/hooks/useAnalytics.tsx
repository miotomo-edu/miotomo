import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ANALYTICS_BASE_URL =
  "https://littleark--a3f08acc7cb911f08eaf0224a6c84d84.web.val.run";
const ANALYZE_PATH = "/analyze";
const STATUS_PATH = "/analytics-status";

interface AnalyzePayload {
  conversationId: string;
  bookId: string;
  chapterStart: number;
  chapterEnd: number;
  saveResults?: boolean;
}

type AnalyticsContextValue = {
  isAnalyzing: boolean;
  wakeAnalytics: () => Promise<void>;
  callAnalyzeConversation: (payload: AnalyzePayload) => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(
  undefined,
);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const wakeAnalytics = useCallback(async () => {
    try {
      await fetch(`${ANALYTICS_BASE_URL}${STATUS_PATH}`);
    } catch (error) {
      console.warn("Analytics wake-up failed", error);
    }
  }, []);

  const callAnalyzeConversation = useCallback(
    async ({
      conversationId,
      bookId,
      chapterStart,
      chapterEnd,
      saveResults = true,
    }: AnalyzePayload) => {
      setIsAnalyzing(true);
      try {
        const response = await fetch(`${ANALYTICS_BASE_URL}${ANALYZE_PATH}`, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            book_id: bookId,
            chapter_start: chapterStart,
            chapter_end: chapterEnd,
            save_results: saveResults,
          }),
        });

        if (!response.ok) {
          throw new Error(`Analytics API error: ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to analyze conversation", error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ isAnalyzing, wakeAnalytics, callAnalyzeConversation }),
    [isAnalyzing, wakeAnalytics, callAnalyzeConversation],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
