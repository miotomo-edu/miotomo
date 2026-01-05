import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import BotAudio from "./audio/BotAudio";

import Layout from "./layout/Layout";
import LandingPage from "./sections/LandingPage";
import HomePage from "./sections/HomePage";
import LibraryPage from "./sections/LibraryPage";
import RewardsSection from "./sections/RewardsSection";
import SettingsSection from "./sections/SettingsSection";
import MapSection from "./sections/MapSection";
import { TalkWithBook } from "./TalkWithBook";
import ProgressSection from "./sections/ProgressSection";
import BottomNavBar from "./common/BottomNavBar";
import OnboardingFlow from "./sections/Onboarding/OnboardingFlow";
import ChapterSelectorModal from "./common/ChapterSelectorModal";

import { VoiceBotProvider } from "../context/VoiceBotContextProvider";
import { useStudent, HARDCODED_STUDENT_ID } from "../hooks/useStudent";
import { useConversations } from "../hooks/useConversations";
import { useAnalytics } from "../hooks/useAnalytics";

// ⬇️ Reusable connection manager (from your new hook file)
import { PipecatConnectionManager } from "../hooks/usePipecatConnection";

const App = ({ transportType, region = "" }) => {
  const [activeComponent, setActiveComponent] = useState("landing");
  const prevActiveComponent = useRef(activeComponent);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [books, setBooks] = useState([]);
  const mainRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterModalBook, setChapterModalBook] = useState(null);
  const [chapterModalChapter, setChapterModalChapter] = useState(1);
  const chapterConfirmCallbackRef = useRef(null);
  const [activeConversations, setActiveConversations] = useState({});
  const [dailyElapsedSeconds, setDailyElapsedSeconds] = useState(0);
  const [latestConversationId, setLatestConversationId] = useState(null);

  // Used to trigger disconnect from BottomNavBar or when leaving interactive
  const disconnectRef = useRef(null);

  const [studentId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("studentId") || "";
  });

  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
  } = useStudent(studentId === "vasu2015" ? HARDCODED_STUDENT_ID : studentId);
  const { getConversations } = useConversations();
  const { isAnalyzing } = useAnalytics();

  useEffect(() => {
    if (student?.name) setUserName(student.name);
  }, [student]);

  const fetchActiveConversations = useCallback(async () => {
    if (!studentId) return;
    try {
      const { data } = await getConversations(studentId);
      const activeMap = {};
      let totalElapsed = 0;
      (data || []).forEach((conv) => {
        if (!conv?.book_id) return;
        const normalizedStatus =
          typeof conv.status === "string" ? conv.status : "";
        if (!activeMap[conv.book_id]) {
          activeMap[conv.book_id] = {
            status: normalizedStatus,
            elapsedSeconds:
              typeof conv.elapsed_seconds === "number"
                ? conv.elapsed_seconds
                : 0,
          };
        }
        if (typeof conv?.elapsed_seconds === "number") {
          totalElapsed += conv.elapsed_seconds;
        }
      });
      setActiveConversations(activeMap);
      setDailyElapsedSeconds(totalElapsed);
      if (data && data.length > 0) {
        setLatestConversationId(data?.[0]?.id ?? null);
      } else {
        const { data: fallbackData } = await getConversations(
          studentId,
          undefined,
          { includeFallback: true },
        );
        setLatestConversationId(fallbackData?.[0]?.id ?? null);
        setDailyElapsedSeconds(0);
      }
    } catch (err) {
      console.warn("Failed to fetch active conversations:", err);
      setDailyElapsedSeconds(0);
    }
  }, [getConversations, studentId]);

  useEffect(() => {
    fetchActiveConversations();
  }, [fetchActiveConversations]);

  useEffect(() => {
    if (activeComponent === "home" || activeComponent === "library") {
      fetchActiveConversations();
    }
  }, [activeComponent, fetchActiveConversations]);

  useEffect(() => {
    if (!isAnalyzing) {
      fetchActiveConversations();
    }
  }, [isAnalyzing, fetchActiveConversations]);

  const normalizeChapterValue = useMemo(() => {
    return (book, rawChapter) => {
      if (!book) return 1;
      const progressValue =
        typeof book.progress === "number" && book.progress > 0
          ? book.progress
          : 1;
      const fallback =
        book.chapters && book.chapters > 0
          ? Math.min(progressValue, book.chapters)
          : progressValue;
      const numeric = Number(rawChapter);
      if (!Number.isFinite(numeric)) {
        return Math.max(1, fallback || 1);
      }
      const rounded = Math.max(1, Math.round(numeric));
      if (book.chapters && book.chapters > 0) {
        return Math.min(rounded, book.chapters);
      }
      return rounded;
    };
  }, []);

  const closeChapterModal = useCallback(() => {
    setIsChapterModalOpen(false);
    setChapterModalBook(null);
    chapterConfirmCallbackRef.current = null;
  }, []);

  const goToMapWithSelection = useCallback(
    (book, chapterValue) => {
      if (!book) return;
      const resolvedChapter = normalizeChapterValue(book, chapterValue);
      setSelectedBook(book);
      setSelectedChapter(resolvedChapter);
      setActiveComponent("map");
    },
    [normalizeChapterValue],
  );

  const handleChapterModalConfirm = useCallback(() => {
    if (!chapterModalBook) return;
    const confirmedChapter = normalizeChapterValue(
      chapterModalBook,
      chapterModalChapter,
    );
    const callback = chapterConfirmCallbackRef.current;
    if (typeof callback === "function") {
      try {
        callback(confirmedChapter);
      } catch (err) {
        console.error("Chapter confirmation callback failed:", err);
      }
    }
    goToMapWithSelection(chapterModalBook, confirmedChapter);
    closeChapterModal();
  }, [
    chapterModalBook,
    chapterModalChapter,
    normalizeChapterValue,
    goToMapWithSelection,
    closeChapterModal,
  ]);

  const handleChapterModalCancel = useCallback(() => {
    closeChapterModal();
  }, [closeChapterModal]);

  const handleChapterModalChange = useCallback((value) => {
    const numeric = Number(value);
    setChapterModalChapter(Number.isFinite(numeric) ? numeric : 1);
  }, []);

  const handleBookSelectForMap = useCallback(
    (book, chapter, options = {}) => {
      if (!book) return;
      const initialChapter = normalizeChapterValue(book, chapter);
      const { skipChapterModal = false, onChapterConfirmed } = options;

      if (skipChapterModal) {
        if (typeof onChapterConfirmed === "function") {
          try {
            onChapterConfirmed(initialChapter);
          } catch (err) {
            console.error("Chapter confirmation callback failed:", err);
          }
        }
        goToMapWithSelection(book, initialChapter);
        return;
      }

      chapterConfirmCallbackRef.current =
        typeof onChapterConfirmed === "function" ? onChapterConfirmed : null;
      setChapterModalBook(book);
      setChapterModalChapter(initialChapter);
      setIsChapterModalOpen(true);
    },
    [normalizeChapterValue, goToMapWithSelection],
  );

  const updatedBotConfig = useMemo(
    () => ({
      voice: currentCharacter?.voice ?? "default-voice",
      transportType, // 'daily' or 'webrtc' from main.tsx
      metadata: {
        book: selectedBook,
        chapter: selectedChapter,
        studentName: userName,
        studentId,
        region,
        character: currentCharacter,
      },
    }),
    [
      currentCharacter,
      selectedBook,
      selectedChapter,
      userName,
      studentId,
      region,
      transportType,
    ],
  );

  const handleBookAndCharacterSelect = (book, character) => {
    setSelectedBook(book);
    setCurrentCharacter(character);
    setActiveComponent("interactive");
  };

  const handleNavigationClick = async (componentName) => {
    // CRITICAL: When leaving the talk screen, ensure full disconnect
    if (activeComponent === "interactive" && disconnectRef.current) {
      console.log("🔌 Triggering disconnect from navigation");
      try {
        await disconnectRef.current();
        // Give time for cleanup
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error("Error during navigation disconnect:", err);
      }
    }
    setActiveComponent(componentName);
    prevActiveComponent.current = componentName;
  };

  const isInteractiveView = activeComponent === "interactive";
  const characterAccent =
    isInteractiveView && currentCharacter?.customBg
      ? currentCharacter.customBg
      : undefined;
  const characterBgClass =
    isInteractiveView && currentCharacter?.bg ? currentCharacter.bg : "";

  const shouldShowConnectionManager =
    isInteractiveView && selectedBook && currentCharacter;

  useEffect(() => {
    if (!isInteractiveView) return;

    const scrollTargets = [mainRef.current, window, document.documentElement];

    scrollTargets.forEach((target) => {
      if (!target) return;
      if ("scrollTo" in target) {
        target.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } else if (target instanceof HTMLElement) {
        target.scrollTop = 0;
      }
    });
  }, [isInteractiveView, mainRef]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "landing":
        return (
          <LandingPage onContinue={() => setActiveComponent("onboarding")} />
        );
      case "onboarding":
        return (
          <OnboardingFlow onFinish={() => setActiveComponent("library")} />
        );
      case "home":
        return (
          <HomePage
            books={books}
            setBooks={(arr) => setBooks(Array.isArray(arr) ? arr : [])}
            onContinue={() => setActiveComponent("interactive")}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            onBookAndCharacterSelect={handleBookAndCharacterSelect}
            userName={userName}
            studentId={studentId}
            activeConversations={activeConversations}
            dailyElapsedSeconds={dailyElapsedSeconds}
            onBookSelectForMap={handleBookSelectForMap}
          />
        );
      case "library":
        return (
          <LibraryPage
            books={books}
            setBooks={(arr) => setBooks(Array.isArray(arr) ? arr : [])}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            onBookAndCharacterSelect={handleBookAndCharacterSelect}
            onContinue={() => setActiveComponent("interactive")}
            userName={userName}
            studentId={studentId}
            activeConversations={activeConversations}
            dailyElapsedSeconds={dailyElapsedSeconds}
            onBookSelectForMap={handleBookSelectForMap}
          />
        );
      case "progress":
        return (
          <ProgressSection conversationId={latestConversationId || undefined} />
        );
      case "rewards":
        return <RewardsSection />;
      case "settings":
        return <SettingsSection />;
      case "map":
        return (
          <MapSection
            book={selectedBook}
            chapter={selectedChapter}
            onSelectModality={(character) =>
              handleBookAndCharacterSelect(selectedBook, character)
            }
            onBack={() => setActiveComponent("library")}
          />
        );
      case "interactive":
        return (
          <VoiceBotProvider>
            <TalkWithBook
              botConfig={updatedBotConfig}
              onNavigate={setActiveComponent}
              selectedBook={selectedBook}
              chapter={selectedChapter}
              currentCharacter={currentCharacter}
              userName={userName}
              studentId={studentId}
              region={region}
              showControlButton={false} // hide controls; autostart path
              onDisconnectRequest={disconnectRef}
              connectionManagedExternally={shouldShowConnectionManager}
            />
            <BotAudio volume={1} playbackRate={1} />
          </VoiceBotProvider>
        );
      default:
        return <LandingPage />;
    }
  };

  // 👉 IMPORTANT: Key the connection manager on book:chapter:character so it remounts
  const connectionKey = `${selectedBook?.id || "none"}:${selectedChapter || 0}:${currentCharacter?.name || "none"}`;

  const appShellStyle = characterAccent
    ? {
        backgroundColor: characterAccent,
        transition: "background-color 0.4s ease",
      }
    : undefined;

  if (studentLoading) return <div>Loading student...</div>;
  if (studentError) return <div>Error loading student.</div>;
  if (!studentId || studentError || (!studentLoading && !student)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
        }}
      >
        coming soon...
      </div>
    );
  }

  return (
    <div
      className={`app-mobile-shell ${characterBgClass}`}
      style={appShellStyle}
    >
      <Layout mainRef={mainRef} disableScroll={isInteractiveView}>
        {activeComponent === "landing" ? (
          renderComponent()
        ) : (
          <div
            style={{
              flexGrow: 1,
              overflowY: isInteractiveView ? "hidden" : "auto",
            }}
          >
            {renderComponent()}
          </div>
        )}
      </Layout>

      {/* 🔌 Only pre-connect when on interactive screen */}
      {shouldShowConnectionManager && (
        <PipecatConnectionManager
          key={connectionKey}
          autoConnect
          botConfig={updatedBotConfig}
          userName={userName}
          studentId={studentId}
          selectedBook={selectedBook}
          chapter={selectedChapter}
          region={region}
          onDisconnectRef={disconnectRef}
        />
      )}

      <ChapterSelectorModal
        isOpen={isChapterModalOpen}
        book={chapterModalBook}
        selectedChapter={chapterModalChapter}
        onChapterChange={handleChapterModalChange}
        onConfirm={handleChapterModalConfirm}
        onCancel={handleChapterModalCancel}
      />

      {activeComponent !== "landing" && activeComponent !== "onboarding" && (
        <BottomNavBar
          onItemClick={handleNavigationClick}
          activeComponentName={activeComponent}
          className={isInteractiveView ? "backdrop-blur-sm" : ""}
          style={
            isInteractiveView
              ? { backgroundColor: "rgba(255,255,255,0.6)" }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default App;
