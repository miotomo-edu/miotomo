import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import Layout from "./layout/Layout";
import LandingPage from "./sections/LandingPage";
import HomePage from "./sections/HomePage";
import LibraryPage from "./sections/LibraryPage";
import PostOnboardingCircleIntroPage from "./sections/PostOnboardingCircleIntroPage";
import DotCompletionPage from "./sections/DotCompletionPage";
import DemoSubscriptionPage from "./sections/DemoSubscriptionPage";
import RewardsSection from "./sections/RewardsSection";
import ParentsSection from "./sections/ParentsSection";
import SettingsSection from "./sections/SettingsSection";
import MapSection from "./sections/MapSection";
import CirclePage from "./sections/CirclePage";
import { TalkWithBook } from "./TalkWithBook";
import ProgressSection from "./sections/ProgressSection";
import BottomNavBar from "./common/BottomNavBar";
import OnboardingFlow from "./sections/Onboarding/OnboardingFlow";

import { VoiceBotProvider } from "../context/VoiceBotContextProvider";
import { useStudent, HARDCODED_STUDENT_ID } from "../hooks/useStudent";
import { useConversations } from "../hooks/useConversations";
import { useAnalytics } from "../hooks/useAnalytics";
import { useBrowseCircles } from "../hooks/useBrowseCircles";
import { characterData } from "../lib/characters";
import { getPreviewConfig } from "../lib/previewMode";

// ⬇️ Reusable connection manager (from your new hook file)
import { PipecatConnectionManager } from "../hooks/usePipecatConnection";

const normalizeDotTypeSlug = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
};

const shouldSkipOnboarding = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const value = params.get("skipOnboarding");
  return value === "1" || value === "true";
};

const shouldEnableScreenshotMode = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const value = params.get("screenshotMode");
  return value === "1" || value === "true";
};

const isWithinWindow = (start, end) => {
  const now = Date.now();
  if (start) {
    const startTime = Date.parse(start);
    if (!Number.isNaN(startTime) && now < startTime) {
      return false;
    }
  }
  if (end) {
    const endTime = Date.parse(end);
    if (!Number.isNaN(endTime) && now > endTime) {
      return false;
    }
  }
  return true;
};

const App = ({ transportType, region = "" }) => {
  const previewConfig = useMemo(() => getPreviewConfig(), []);
  const screenshotMode = useMemo(() => shouldEnableScreenshotMode(), []);
  const [activeComponent, setActiveComponent] = useState(() =>
    previewConfig?.screen === "first-circle-intro"
      ? "first-circle-intro"
      : previewConfig?.screen === "circle-page"
      ? "circle"
      : previewConfig?.screen === "dot-complete" ||
          previewConfig?.screen === "circle-complete"
      ? "dot-complete"
      : previewConfig?.screen === "vocab-intro" ||
          previewConfig?.screen === "vocab-game" ||
          previewConfig?.screen === "vocab-complete" ||
          previewConfig?.screen === "spelling-intro" ||
          previewConfig?.screen === "spelling-game" ||
          previewConfig?.screen === "spelling-complete"
        ? "vocabulary-game"
        : shouldSkipOnboarding()
          ? "library"
          : "landing",
  );
  const prevActiveComponent = useRef(activeComponent);
  const [selectedBook, setSelectedBook] = useState(() => previewConfig?.book ?? null);
  const [selectedChapter, setSelectedChapter] = useState(
    () => previewConfig?.completedDot ?? 1,
  );
  const [selectedDotTitle, setSelectedDotTitle] = useState("");
  const [selectedDotTypeSlug, setSelectedDotTypeSlug] = useState(null);
  const [completedDotChapter, setCompletedDotChapter] = useState(
    () =>
      previewConfig?.screen === "dot-complete" ||
      previewConfig?.screen === "circle-complete"
        ? previewConfig.completedDot
        : null,
  );
  const [isDemoSession, setIsDemoSession] = useState(false);
  const mainRef = useRef(null);
  const scrollPositionsRef = useRef({});
  const [userName, setUserName] = useState(() => previewConfig?.userName ?? "");
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [circleReturnComponent, setCircleReturnComponent] = useState("library");
  const [shouldStartSession, setShouldStartSession] = useState(false);
  const [latestConversationId, setLatestConversationId] = useState(null);
  const [libraryHeroCollapseSignal, setLibraryHeroCollapseSignal] = useState(0);

  // Used to trigger disconnect from BottomNavBar or when leaving interactive
  const disconnectRef = useRef(null);

  const [studentId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const fromSearch = params.get("studentId");
    if (fromSearch) return fromSearch;

    const overridePath = params.get("p");
    const pathSource =
      typeof overridePath === "string" && overridePath.length > 0
        ? overridePath
        : window.location.pathname;
    const pathParts = pathSource.split("/").filter((part) => part.length > 0);
    for (let i = 0; i < pathParts.length; i += 1) {
      const part = pathParts[i];
      const lower = part.toLowerCase();
      if (lower === "studentid" && pathParts[i + 1]) {
        return decodeURIComponent(pathParts[i + 1]);
      }
      if (part.includes("=")) {
        const [key, value] = part.split("=");
        if (key?.toLowerCase() === "studentid" && value) {
          return decodeURIComponent(value);
        }
      }
    }

    const rawHash = window.location.hash || "";
    const hash = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
    const hashQuery = hash.includes("?")
      ? hash.split("?")[1]
      : hash.includes("=")
        ? hash
        : "";
    if (!hashQuery) return "";
    const hashParams = new URLSearchParams(hashQuery);
    return hashParams.get("studentId") || "";
  });

  const resolvedStudentId =
    studentId === "vasu2015"
      ? HARDCODED_STUDENT_ID
      : studentId || (previewConfig ? HARDCODED_STUDENT_ID : studentId);
  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
  } = useStudent(resolvedStudentId);
  const { data: browseData } = useBrowseCircles(resolvedStudentId);
  const { getConversations } = useConversations();
  const { isAnalyzing, wakeAnalytics } = useAnalytics();

  const previewCircleSelection = useMemo(() => {
    if (previewConfig?.screen !== "circle-page" || !browseData?.circles?.length) {
      return null;
    }

    const featuredEntries = browseData.circles
      .filter((circle) => {
        const catalog = circle.catalog ?? {};
        return (
          Boolean(catalog.featured) &&
          isWithinWindow(catalog.featured_start, catalog.featured_end)
        );
      })
      .sort((a, b) => {
        const rankA = a.catalog?.featured_rank ?? Number.POSITIVE_INFINITY;
        const rankB = b.catalog?.featured_rank ?? Number.POSITIVE_INFINITY;
        if (rankA !== rankB) return rankA - rankB;

        const publishedA = a.catalog?.published_at
          ? Date.parse(a.catalog.published_at)
          : Number.NEGATIVE_INFINITY;
        const publishedB = b.catalog?.published_at
          ? Date.parse(b.catalog.published_at)
          : Number.NEGATIVE_INFINITY;
        return publishedB - publishedA;
      });

    const book = featuredEntries[0] ?? browseData.circles[0] ?? null;
    if (!book) return null;

    const progressRows = browseData.progressRows ?? [];
    const activeRows = progressRows.filter((row) => {
      if (row.book_id !== book.id) return false;
      const listening = row.listening_status ?? "not_started";
      const talking = row.talking_status ?? "not_started";
      if (talking === "completed") return false;
      return (
        ["paused", "in_progress"].includes(listening) ||
        ["paused", "in_progress"].includes(talking)
      );
    });

    const activeRow = activeRows.sort((a, b) => {
      const timeA = Date.parse(a.last_active_at ?? "");
      const timeB = Date.parse(b.last_active_at ?? "");
      if (Number.isNaN(timeA)) return 1;
      if (Number.isNaN(timeB)) return -1;
      return timeB - timeA;
    })[0];

    let completedDots = 0;
    progressRows.forEach((row) => {
      if (row.book_id !== book.id || row.talking_status !== "completed") return;
      const episode = Number(row.episode ?? 0);
      if (Number.isFinite(episode) && episode > completedDots) {
        completedDots = episode;
      }
    });

    const totalDots = Math.max(Number(book.chapters) || 0, 0);
    const nextChapter = activeRow?.episode
      ? Number(activeRow.episode)
      : totalDots > 0 && completedDots >= totalDots
        ? 1
        : Math.max(completedDots + 1, 1);

    return {
      book,
      nextChapter: Number.isFinite(nextChapter) && nextChapter > 0 ? nextChapter : 1,
    };
  }, [browseData, previewConfig?.screen]);

  useEffect(() => {
    void wakeAnalytics();
    const wakeInterval = window.setInterval(() => {
      void wakeAnalytics();
    }, 45_000);

    return () => {
      window.clearInterval(wakeInterval);
    };
  }, [wakeAnalytics]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (!html || !body) return undefined;

    html.classList.toggle("screenshot-mode", screenshotMode);
    body.classList.toggle("screenshot-mode", screenshotMode);

    return () => {
      html.classList.remove("screenshot-mode");
      body.classList.remove("screenshot-mode");
    };
  }, [screenshotMode]);

  useEffect(() => {
    if (previewConfig?.userName) return;
    if (student?.name) setUserName(student.name);
  }, [student, previewConfig?.userName]);

  useEffect(() => {
    if (previewConfig?.screen !== "circle-page" || !previewCircleSelection) return;
    setSelectedBook(previewCircleSelection.book);
    setSelectedChapter(previewCircleSelection.nextChapter);
  }, [previewConfig?.screen, previewCircleSelection]);

  const fetchActiveConversations = useCallback(async () => {
    if (!studentId) return;
    try {
      const { data } = await getConversations(studentId);
      if (data && data.length > 0) {
        setLatestConversationId(data?.[0]?.id ?? null);
      } else {
        const { data: fallbackData } = await getConversations(
          studentId,
          undefined,
          { includeFallback: true },
        );
        setLatestConversationId(fallbackData?.[0]?.id ?? null);
      }
    } catch (err) {
      console.warn("Failed to fetch active conversations:", err);
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
    const shouldClearSelection =
      activeComponent === "landing" ||
      activeComponent === "onboarding" ||
      activeComponent === "first-circle-intro" ||
      activeComponent === "home" ||
      activeComponent === "library" ||
      activeComponent === "progress" ||
      activeComponent === "parents" ||
      activeComponent === "settings";

    if (!shouldClearSelection) return;

    setSelectedBook(null);
    setSelectedChapter(1);
    setSelectedDotTitle("");
    setSelectedDotTypeSlug(null);
    setIsDemoSession(false);
  }, [activeComponent]);

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
      const fallback = progressValue;
      const numeric = Number(rawChapter);
      if (!Number.isFinite(numeric)) {
        return Math.max(1, fallback || 1);
      }
      const rounded = Math.max(1, Math.round(numeric));
      return rounded;
    };
  }, []);

  const openCirclePage = useCallback(
    (book, chapterValue) => {
      if (!book) return;
      const resolvedChapter = normalizeChapterValue(book, chapterValue);
      const scrollTarget = mainRef.current;
      if (scrollTarget instanceof HTMLElement) {
        scrollPositionsRef.current[activeComponent] = scrollTarget.scrollTop;
      }
      setSelectedBook(book);
      setSelectedChapter(resolvedChapter);
      setSelectedDotTypeSlug(null);
      setCircleReturnComponent(activeComponent);
      setActiveComponent("circle");
    },
    [normalizeChapterValue, activeComponent],
  );

  const handlePlayEpisode = useCallback(
    (book, chapterValue, dotTitle, dotTypeSlug) => {
      if (!book) return;
      const resolvedChapter = normalizeChapterValue(book, chapterValue);
      const nextIsDemoSession =
        activeComponent === "first-circle-intro" && Boolean(book?.demo);
      setSelectedBook(book);
      setSelectedChapter(resolvedChapter);
      setSelectedDotTitle(typeof dotTitle === "string" ? dotTitle : "");
      setSelectedDotTypeSlug(normalizeDotTypeSlug(dotTypeSlug));
      setIsDemoSession(nextIsDemoSession);
      if (!currentCharacter) {
        const defaultCharacter =
          characterData.find((character) => !character.disabled) ??
          characterData[0] ??
          null;
        if (defaultCharacter) {
          setCurrentCharacter(defaultCharacter);
        }
      }
      setActiveComponent("interactive");
    },
    [normalizeChapterValue, currentCharacter, activeComponent],
  );

  const handleShowDotCompletion = useCallback((options = {}) => {
    if (!selectedBook) return;
    setCompletedDotChapter(selectedChapter);
    if (options.openVocabularyGame) {
      setActiveComponent("vocabulary-game");
      return;
    }
    setActiveComponent(isDemoSession ? "demo-subscribe" : "dot-complete");
  }, [selectedBook, selectedChapter, isDemoSession]);

  const handlePreviewNextDotFromCompletion = useCallback(
    (book, chapterValue) => {
      if (!book) return;
      const resolvedChapter = normalizeChapterValue(book, chapterValue);
      setSelectedBook(book);
      setSelectedChapter(resolvedChapter);
      setSelectedDotTypeSlug(null);
      setCircleReturnComponent("library");
      setActiveComponent("circle");
    },
    [normalizeChapterValue],
  );

  const updatedBotConfig = useMemo(() => {
    const forcedModeByDotType =
      selectedDotTypeSlug === "storytelling"
        ? "storytelling"
        : selectedDotTypeSlug === "teachtime"
          ? "teachtime"
          : null;
    const characterMetadata = {
      ...(currentCharacter ?? {}),
    };
    if (forcedModeByDotType) {
      characterMetadata.prompt = forcedModeByDotType;
      characterMetadata.modalities = forcedModeByDotType;
    }

    return {
      voice: currentCharacter?.voice ?? "default-voice",
      transportType, // 'daily' or 'webrtc' from main.tsx
      metadata: {
        book: selectedBook,
        chapter: selectedChapter,
        studentName: userName,
        studentId,
        region,
        dotType: selectedDotTypeSlug,
        character: characterMetadata,
      },
    };
  }, [
    currentCharacter,
    selectedBook,
    selectedChapter,
    userName,
    studentId,
    region,
    selectedDotTypeSlug,
    transportType,
  ]);

  const handleBookAndCharacterSelect = (book, character) => {
    setSelectedBook(book);
    setCurrentCharacter(character);
    setSelectedDotTypeSlug(null);
    setActiveComponent("interactive");
  };

  const handleNavigationClick = async (componentName) => {
    if (componentName === "library" && activeComponent === "library") {
      setLibraryHeroCollapseSignal((prev) => prev + 1);
    }
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
    if (!isInteractiveView) {
      setShouldStartSession(false);
    }
  }, [isInteractiveView]);

  useEffect(() => {
    setShouldStartSession(false);
  }, [selectedBook?.id, selectedChapter, currentCharacter?.name]);

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

  useEffect(() => {
    if (activeComponent === "circle" || isInteractiveView) return;
    const scrollTarget = mainRef.current;
    const saved = scrollPositionsRef.current[activeComponent];
    if (scrollTarget instanceof HTMLElement && typeof saved === "number") {
      scrollTarget.scrollTo({ top: saved, left: 0, behavior: "auto" });
    }
  }, [activeComponent, isInteractiveView]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "landing":
        return (
          <LandingPage onContinue={() => setActiveComponent("onboarding")} />
        );
      case "onboarding":
        return (
          <OnboardingFlow
            onFinish={() => setActiveComponent("first-circle-intro")}
          />
        );
      case "first-circle-intro":
        return (
          <PostOnboardingCircleIntroPage
            userName={userName}
            studentId={resolvedStudentId}
            onPlayEpisode={handlePlayEpisode}
          />
        );
      case "home":
        return (
          <HomePage
            userName={userName}
            studentId={resolvedStudentId}
            onOpenCircle={openCirclePage}
            onPlayEpisode={handlePlayEpisode}
          />
        );
      case "library":
        return (
          <LibraryPage
            userName={userName}
            studentId={resolvedStudentId}
            collapseHeroSignal={libraryHeroCollapseSignal}
            onOpenCircle={openCirclePage}
            onPlayEpisode={handlePlayEpisode}
          />
        );
      case "circle":
        if (!selectedBook) {
          return (
            <LibraryPage
              userName={userName}
              studentId={resolvedStudentId}
              collapseHeroSignal={libraryHeroCollapseSignal}
              onOpenCircle={openCirclePage}
              onPlayEpisode={handlePlayEpisode}
            />
          );
        }
        return (
          <CirclePage
            book={selectedBook}
            studentId={resolvedStudentId}
            userName={userName}
            scrollContainerRef={mainRef}
            onBack={() =>
              setActiveComponent(circleReturnComponent || "library")
            }
            onPlayEpisode={handlePlayEpisode}
            onSelectCircle={openCirclePage}
          />
        );
      case "progress":
        return (
          <ProgressSection
            conversationId={latestConversationId || undefined}
            userName={userName}
          />
        );
      case "dot-complete":
        if (!selectedBook) {
          return (
            <LibraryPage
              userName={userName}
              studentId={resolvedStudentId}
              collapseHeroSignal={libraryHeroCollapseSignal}
              onOpenCircle={openCirclePage}
              onPlayEpisode={handlePlayEpisode}
            />
          );
        }
        return (
          <DotCompletionPage
            book={selectedBook}
            userName={userName}
            completedEpisode={completedDotChapter || selectedChapter || 1}
            onPreviewNextDot={handlePreviewNextDotFromCompletion}
          />
        );
      case "demo-subscribe":
        return (
          <DemoSubscriptionPage
            userName={userName}
            onContinue={() => setActiveComponent("library")}
          />
        );
      case "vocabulary-game":
        return (
          <RewardsSection
            onComplete={() => handleShowDotCompletion()}
            previewScreen={previewConfig?.screen ?? null}
          />
        );
      case "parents":
        return <ParentsSection />;
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
              onNavigate={handleNavigationClick}
              selectedBook={selectedBook}
              chapter={selectedChapter}
              dotTitle={selectedDotTitle}
              currentCharacter={currentCharacter}
              userName={userName}
              studentId={resolvedStudentId}
              region={region}
              showControlButton={false} // hide controls; autostart path
              onDisconnectRequest={disconnectRef}
              connectionManagedExternally={shouldShowConnectionManager}
              onRequestSessionStart={() => setShouldStartSession(true)}
              onShowDotCompletion={handleShowDotCompletion}
            />
          </VoiceBotProvider>
        );
      default:
        return <LandingPage />;
    }
  };

  // 👉 IMPORTANT: Key the connection manager on book:chapter:character so it remounts
  const characterKey =
    currentCharacter?.prompt ||
    currentCharacter?.modalities ||
    currentCharacter?.name ||
    "none";
  const connectionKey = `${selectedBook?.id || "none"}:${selectedChapter || 0}:${characterKey}:${selectedDotTypeSlug || "none"}`;

  const appShellStyle = characterAccent
    ? {
        backgroundColor: characterAccent,
        transition: "background-color 0.4s ease",
      }
    : undefined;

  if (!previewConfig && studentLoading) return <div>Loading student...</div>;
  if (!previewConfig && studentError) return <div>Error loading student.</div>;
  if (
    !previewConfig &&
    (!studentId || studentError || (!studentLoading && !student))
  ) {
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

  const mainBackgroundClass =
    activeComponent === "vocabulary-game"
      ? "bg-[#2F2C2F]"
      : activeComponent === "parents"
        ? "bg-[#F6EFE2]"
      : activeComponent === "progress"
        ? "bg-white"
        : activeComponent === "onboarding"
          ? "bg-white"
          : activeComponent === "interactive"
            ? "bg-black"
            : activeComponent === "demo-subscribe"
              ? "bg-[#F6EFE2]"
              : activeComponent === "dot-complete"
                ? "bg-white"
                : activeComponent === "library" ||
                    activeComponent === "home" ||
                    activeComponent === "circle"
                  ? "bg-library"
                  : activeComponent === "first-circle-intro"
                    ? "bg-[#F4ECDF]"
                    : "";

  return (
    <div
      className={`app-mobile-shell ${screenshotMode ? "app-screenshot-shell" : ""} ${characterBgClass}`}
      style={appShellStyle}
    >
      <Layout
        mainRef={mainRef}
        disableScroll={isInteractiveView}
        screenshotMode={screenshotMode}
        withBottomNav={
          activeComponent !== "landing" &&
          activeComponent !== "onboarding" &&
          activeComponent !== "first-circle-intro" &&
          activeComponent !== "demo-subscribe"
        }
        fullHeight={
          activeComponent === "vocabulary-game" ||
          activeComponent === "parents"
        }
        mainClassName={mainBackgroundClass}
      >
        {activeComponent === "landing" ? (
          renderComponent()
        ) : (
          <div className={screenshotMode ? "" : "h-full min-h-0"}>
            {renderComponent()}
          </div>
        )}
      </Layout>

      {/* 🔌 Only pre-connect when on interactive screen */}
      {shouldShowConnectionManager && (
        <PipecatConnectionManager
          key={connectionKey}
          autoConnect={shouldStartSession}
          botConfig={updatedBotConfig}
          userName={userName}
          studentId={studentId}
          selectedBook={selectedBook}
          chapter={selectedChapter}
          region={region}
          onDisconnectRef={disconnectRef}
        />
      )}

      {activeComponent !== "landing" &&
        activeComponent !== "onboarding" &&
        activeComponent !== "first-circle-intro" &&
        activeComponent !== "demo-subscribe" && (
          <BottomNavBar
            onItemClick={handleNavigationClick}
            className={screenshotMode ? "screenshot-mode-bottom-nav" : ""}
            activeComponentName={
              activeComponent === "first-circle-intro" ||
              activeComponent === "dot-complete" ||
              activeComponent === "demo-subscribe"
                ? "library"
                : activeComponent
            }
            className={isInteractiveView ? "backdrop-blur-sm" : ""}
          />
        )}
    </div>
  );
};

export default App;
