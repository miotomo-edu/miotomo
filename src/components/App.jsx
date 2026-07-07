import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { PipecatClientProvider } from "@pipecat-ai/client-react";
import { LogLevel, PipecatClient, logger } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import { DailyTransport } from "@pipecat-ai/daily-transport";

import Layout from "./layout/Layout";
import LandingPage from "./sections/LandingPage";
import BrowsePage from "./sections/BrowsePage";
import PostOnboardingCircleIntroPage from "./sections/PostOnboardingCircleIntroPage";
import DotCompletionPage from "./sections/DotCompletionPage";
import DemoSubscriptionPage from "./sections/DemoSubscriptionPage";
import RewardsSection from "./sections/RewardsSection";
import ParentsSection from "./sections/ParentsSection";
import SettingsSection from "./sections/SettingsSection";
import MapSection from "./sections/MapSection";
import CirclePage from "./sections/CirclePage";
import { TalkWithBook } from "./TalkWithBook";
import ProgressSectionV3 from "./sections/ProgressSectionV3";
import BottomNavBar from "./common/BottomNavBar";
import OnboardingFlow from "./sections/Onboarding/OnboardingFlow";

import { VoiceBotProvider } from "../context/VoiceBotContextProvider";
import { useStudent, HARDCODED_STUDENT_ID } from "../hooks/useStudent";
import { useConversations } from "../hooks/useConversations";
import { useAnalytics } from "../hooks/useAnalytics";
import { useBrowseCircles } from "../hooks/useBrowseCircles";
import { useAppUsageTracker } from "../hooks/useAppUsageTracker";
import { characterData } from "../lib/characters";
import { getPreviewConfig } from "../lib/previewMode";
import { getBooleanQueryParam, getQueryParam } from "../lib/runtimeParams";

// ⬇️ Reusable connection manager (from your new hook file)
import { PipecatConnectionManager } from "../hooks/usePipecatConnection";

logger.setLevel(LogLevel.WARN);

class AECMediaManager {
  async getUserMedia() {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // These are already browser defaults, but being explicit
        // forces the browser not to skip them for performance
      },
      video: false,
    });
  }
}

const isStandaloneDisplayMode = () => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if (window.navigator?.standalone === true) return true;
  return document.referrer.startsWith("android-app://");
};

const shouldEnforcePortraitUi = () => {
  if (typeof window === "undefined") return false;
  if (shouldUseDesktopIpadFrame()) return false;

  const touchLikeDevice =
    window.matchMedia?.("(hover: none), (pointer: coarse)").matches ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 1);

  return Boolean(touchLikeDevice);
};

const isLandscapeViewport = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth > window.innerHeight;
};

const PortraitOrientationBlocker = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#120f12] px-6 py-8 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Rotate device to portrait"
    >
      <div className="flex w-full max-w-[28rem] flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="flex h-11 w-8 items-center justify-center rounded-[14px] border-2 border-[#F8D44C]">
            <div className="h-4 w-4 rounded-full bg-[#F8D44C]" />
          </div>
        </div>
        <p className="font-['Baloo_2'] text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-[#FFF5D6]">
          Hold it upright
        </p>
        <p className="mt-4 max-w-[22rem] text-base font-semibold leading-7 text-white/80">
          Miotomo is designed for portrait mode. Rotate your device back upright
          to continue.
        </p>
      </div>
    </div>
  );
};

const normalizeDotTypeSlug = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
};

const shouldSkipOnboarding = () => {
  return getBooleanQueryParam("skipOnboarding");
};

const shouldEnableScreenshotMode = () => {
  return getBooleanQueryParam("screenshotMode");
};

const shouldUsePlaybackOnlyFallback = () => {
  if (typeof window === "undefined") return false;
  if (getBooleanQueryParam("playbackOnly")) return true;

  const hostname = window.location.hostname;
  const isLoopbackHost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  return !window.isSecureContext && !isLoopbackHost;
};

const requestMicPermissionWarmup = async () => {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });

  stream.getTracks().forEach((track) => track.stop());
};

const mapComponentToUsageSection = (componentName) => {
  switch (componentName) {
    case "first-circle-intro":
      return "circle_intro";
    case "interactive":
      return "discussion";
    case "dot-complete":
      return "dot_complete";
    case "demo-subscribe":
      return "demo_subscribe";
    case "vocabulary-game":
      return "modality_game";
    default:
      return componentName;
  }
};

const shouldUseDesktopIpadFrame = () => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia(
    "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
  ).matches;
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

const getPageScrollTop = () => {
  if (typeof window === "undefined") return 0;
  const scrollingElement =
    document.scrollingElement ?? document.documentElement;
  return window.scrollY || scrollingElement.scrollTop || 0;
};

const InteractiveVoiceSession = ({
  clientKey,
  transportType,
  shouldStartSession,
  updatedBotConfig,
  userName,
  studentId,
  selectedBook,
  selectedChapter,
  selectedDotTitle,
  currentCharacter,
  region,
  talkDisconnectRef,
  managerDisconnectRef,
  shouldShowConnectionManager,
  setShouldStartSession,
  handleNavigationClick,
  handleShowDotCompletion,
  previewScreen,
  trackUsageEvent,
  suppressSessionBootstrap = false,
}) => {
  const client = useMemo(() => {
    if (suppressSessionBootstrap) {
      console.log(
        "▶️ playbackOnly mode active: skipping Pipecat transport/client bootstrap",
      );
      return null;
    }

    const usesDailyTransport =
      transportType === "daily" || transportType === "local-daily";
    const transport = usesDailyTransport
      ? new DailyTransport()
      : new SmallWebRTCTransport({
          enableMic: true,
          enableCam: false,
        });

    return new PipecatClient({
      transport,
      enableMic: true,
      callbacks: {
        onConnected: () => console.log("Pipecat connected"),
        onBotConnected: (participant) =>
          console.log(`Bot connected: ${JSON.stringify(participant)}`),
        onBotReady: () => console.log("Bot ready to chat!"),
        onUserTranscript: (data) => {
          if (data.final) console.log("User said:", data.text);
        },
        onBotOutput: (data) => {
          if (data.aggregated_by === "sentence") {
            console.log("Bot said (sentence):", data.text);
          }
        },
        onDisconnected: () => console.log("Disconnected"),
        onBotDisconnected: () => console.log("Bot disconnected"),
      },
    });
  }, [clientKey, suppressSessionBootstrap, transportType]);

  useEffect(() => {
    return () => {
      setShouldStartSession(false);
    };
  }, [setShouldStartSession]);

  return (
    <PipecatClientProvider client={client}>
      <VoiceBotProvider>
        <TalkWithBook
          botConfig={updatedBotConfig}
          onNavigate={handleNavigationClick}
          selectedBook={selectedBook}
          chapter={selectedChapter}
          dotTitle={selectedDotTitle}
          currentCharacter={currentCharacter}
          userName={userName}
          studentId={studentId}
          region={region}
          showControlButton={false}
          onDisconnectRequest={talkDisconnectRef}
          connectionManagedExternally={shouldShowConnectionManager}
          onRequestSessionStart={() => setShouldStartSession(true)}
          onShowDotCompletion={handleShowDotCompletion}
          previewScreen={previewScreen}
          trackUsageEvent={trackUsageEvent}
          suppressSessionBootstrap={suppressSessionBootstrap}
        />
      </VoiceBotProvider>

      {shouldShowConnectionManager && (
        <PipecatConnectionManager
          key={clientKey}
          autoConnect={shouldStartSession}
          botConfig={updatedBotConfig}
          userName={userName}
          studentId={studentId}
          selectedBook={selectedBook}
          chapter={selectedChapter}
          region={region}
          onDisconnectRef={managerDisconnectRef}
        />
      )}
    </PipecatClientProvider>
  );
};

const SURVEY_WOBBLE_KEYFRAMES = [
  { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
  { transform: "translate(-4px, 0) rotate(-3deg)", offset: 0.02 },
  { transform: "translate(5px, 0) rotate(3.2deg)", offset: 0.04 },
  { transform: "translate(-6px, 1px) rotate(-4deg)", offset: 0.06 },
  { transform: "translate(6px, -1px) rotate(4deg)", offset: 0.08 },
  { transform: "translate(-3px, 0) rotate(-2deg)", offset: 0.1 },
  { transform: "translate(3px, 0) rotate(2deg)", offset: 0.12 },
  { transform: "translate(0, 0) rotate(0deg)", offset: 0.14 },
  { transform: "translate(0, 0) rotate(0deg)", offset: 1 },
];

const SurveyCtaButton = ({ href, className }) => {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || typeof el.animate !== "function") return;
    const anim = el.animate(SURVEY_WOBBLE_KEYFRAMES, {
      duration: 3200,
      easing: "linear",
      iterations: Infinity,
    });
    return () => anim.cancel();
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      ref={elRef}
      className={className}
    >
      <span className="block leading-[1.15]">
        <span className="block">Share a quick thought!</span>
        <span className="block">Take the survey</span>
      </span>
    </a>
  );
};

const App = ({ transportType, region = "", testingMode = false }) => {
  const previewConfig = useMemo(() => getPreviewConfig(), []);
  const screenshotMode = useMemo(() => shouldEnableScreenshotMode(), []);
  const [desktopIpadFrame, setDesktopIpadFrame] = useState(() =>
    shouldUseDesktopIpadFrame(),
  );
  const [portraitBlocked, setPortraitBlocked] = useState(
    () => shouldEnforcePortraitUi() && isLandscapeViewport(),
  );
  const [activeComponent, setActiveComponent] = useState(() =>
    previewConfig?.screen === "first-circle-intro"
      ? "first-circle-intro"
      : previewConfig?.screen === "circle-page"
        ? "circle"
        : previewConfig?.screen === "demo-subscribe"
          ? "demo-subscribe"
          : previewConfig?.screen === "discussion-complete"
            ? "interactive"
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
  const [selectedBook, setSelectedBook] = useState(
    () => previewConfig?.book ?? null,
  );
  const [selectedChapter, setSelectedChapter] = useState(
    () => previewConfig?.completedDot ?? 1,
  );
  const [selectedDotTitle, setSelectedDotTitle] = useState("");
  const [selectedDotTypeSlug, setSelectedDotTypeSlug] = useState(null);
  const [completedDotChapter, setCompletedDotChapter] = useState(() =>
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

  // Child screen owns graceful teardown; manager owns transport-level fallback cleanup.
  const talkDisconnectRef = useRef(null);
  const managerDisconnectRef = useRef(null);

  const [studentId] = useState(() => {
    const fromSearch = getQueryParam("studentId");
    if (fromSearch) return fromSearch;

    const params = new URLSearchParams(window.location.search);
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
  const { trackAppOpen, trackEvent, trackLifecycleEvent, trackSectionView } =
    useAppUsageTracker({
      studentId: resolvedStudentId,
      userName,
      transportType,
    });
  const playbackOnlyMode = useMemo(() => shouldUsePlaybackOnlyFallback(), []);
  const latestUsageContextRef = useRef({
    section: mapComponentToUsageSection(activeComponent),
    bookId: selectedBook?.id ?? null,
    chapter: selectedChapter ?? null,
    dotTitle: selectedDotTitle || null,
    conversationId: latestConversationId || null,
  });

  const previewCircleSelection = useMemo(() => {
    if (
      previewConfig?.screen !== "circle-page" ||
      !browseData?.circles?.length
    ) {
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
      nextChapter:
        Number.isFinite(nextChapter) && nextChapter > 0 ? nextChapter : 1,
    };
  }, [browseData, previewConfig?.screen]);

  useEffect(() => {
    void wakeAnalytics();
    const wakeInterval =
      import.meta.env.VITE_ENABLE_WARMUP_INTERVAL === "true"
        ? window.setInterval(() => {
            void wakeAnalytics();
          }, 45_000)
        : null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void wakeAnalytics();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (wakeInterval !== null) {
        window.clearInterval(wakeInterval);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [wakeAnalytics]);

  useEffect(() => {
    latestUsageContextRef.current = {
      section: mapComponentToUsageSection(activeComponent),
      bookId: selectedBook?.id ?? null,
      chapter: selectedChapter ?? null,
      dotTitle: selectedDotTitle || null,
      conversationId: latestConversationId || null,
    };
  }, [
    activeComponent,
    latestConversationId,
    selectedBook?.id,
    selectedChapter,
    selectedDotTitle,
  ]);

  useEffect(() => {
    void trackAppOpen({
      section: mapComponentToUsageSection(activeComponent),
      bookId: selectedBook?.id ?? null,
      chapter: selectedChapter ?? null,
      dotTitle: selectedDotTitle || null,
      conversationId: latestConversationId || null,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      referrer:
        typeof document !== "undefined" ? document.referrer || "" : undefined,
    });
  }, [
    activeComponent,
    latestConversationId,
    selectedBook?.id,
    selectedChapter,
    selectedDotTitle,
    trackAppOpen,
  ]);

  useEffect(() => {
    void trackSectionView(mapComponentToUsageSection(activeComponent), {
      bookId: selectedBook?.id ?? null,
      chapter: selectedChapter ?? null,
      dotTitle: selectedDotTitle || null,
      conversationId: latestConversationId || null,
    });
  }, [
    activeComponent,
    latestConversationId,
    selectedBook?.id,
    selectedChapter,
    selectedDotTitle,
    trackSectionView,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      const context = latestUsageContextRef.current;
      trackLifecycleEvent("app_hidden", {
        section: context.section,
        bookId: context.bookId,
        chapter: context.chapter,
        dotTitle: context.dotTitle,
        conversationId: context.conversationId,
      });
    };

    const handleBeforeUnload = () => {
      const context = latestUsageContextRef.current;
      trackLifecycleEvent("app_closed", {
        section: context.section,
        bookId: context.bookId,
        chapter: context.chapter,
        dotTitle: context.dotTitle,
        conversationId: context.conversationId,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [trackLifecycleEvent]);

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
    const html = document.documentElement;
    const body = document.body;
    if (!html || !body) return undefined;

    html.classList.toggle("testing-mode", testingMode);
    body.classList.toggle("testing-mode", testingMode);

    return () => {
      html.classList.remove("testing-mode");
      body.classList.remove("testing-mode");
    };
  }, [testingMode]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
    );
    const syncDesktopFrame = () => {
      setDesktopIpadFrame(mediaQuery.matches);
    };

    syncDesktopFrame();
    mediaQuery.addEventListener("change", syncDesktopFrame);

    return () => {
      mediaQuery.removeEventListener("change", syncDesktopFrame);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (!html || !body) return undefined;

    html.classList.toggle("desktop-ipad-frame", desktopIpadFrame);
    body.classList.toggle("desktop-ipad-frame", desktopIpadFrame);

    return () => {
      html.classList.remove("desktop-ipad-frame");
      body.classList.remove("desktop-ipad-frame");
    };
  }, [desktopIpadFrame]);

  useEffect(() => {
    const syncPortraitGuard = () => {
      setPortraitBlocked(
        shouldEnforcePortraitUi() && !desktopIpadFrame && isLandscapeViewport(),
      );
    };

    syncPortraitGuard();
    window.addEventListener("resize", syncPortraitGuard);
    window.addEventListener("orientationchange", syncPortraitGuard);

    return () => {
      window.removeEventListener("resize", syncPortraitGuard);
      window.removeEventListener("orientationchange", syncPortraitGuard);
    };
  }, [desktopIpadFrame]);

  useEffect(() => {
    const body = document.body;
    if (!body) return undefined;

    const previousOverflow = body.style.overflow;
    if (portraitBlocked) {
      body.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [portraitBlocked]);

  useEffect(() => {
    if (!isStandaloneDisplayMode()) return undefined;
    if (typeof screen === "undefined" || !screen.orientation?.lock) {
      return undefined;
    }

    const tryLockPortrait = () => {
      screen.orientation.lock("portrait-primary").catch(() => {});
    };

    tryLockPortrait();
    document.addEventListener("visibilitychange", tryLockPortrait);

    return () => {
      document.removeEventListener("visibilitychange", tryLockPortrait);
    };
  }, []);

  useEffect(() => {
    if (previewConfig?.userName) return;
    if (student?.name) setUserName(student.name);
  }, [student, previewConfig?.userName]);

  useEffect(() => {
    if (previewConfig?.screen !== "circle-page" || !previewCircleSelection)
      return;
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

  const trackUsageEvent = useCallback(
    async (eventType, details = {}) => {
      await trackEvent(eventType, {
        section: details.section ?? mapComponentToUsageSection(activeComponent),
        bookId: details.bookId ?? selectedBook?.id ?? null,
        chapter: details.chapter ?? selectedChapter ?? null,
        dotTitle: details.dotTitle ?? selectedDotTitle ?? null,
        conversationId: details.conversationId ?? latestConversationId ?? null,
        metadata: details.metadata ?? {},
      });
    },
    [
      activeComponent,
      latestConversationId,
      selectedBook?.id,
      selectedChapter,
      selectedDotTitle,
      trackEvent,
    ],
  );

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
      scrollPositionsRef.current[activeComponent] = getPageScrollTop();
      setSelectedBook(book);
      setSelectedChapter(resolvedChapter);
      setSelectedDotTypeSlug(null);
      setCircleReturnComponent(activeComponent);
      setActiveComponent("circle");
    },
    [normalizeChapterValue, activeComponent],
  );

  const handlePlayEpisode = useCallback(
    async (book, chapterValue, dotTitle, dotTypeSlug) => {
      if (!book) return;
      void wakeAnalytics();

      if (!playbackOnlyMode) {
        try {
          await requestMicPermissionWarmup();
        } catch (error) {
          console.warn("Mic warmup before intro failed:", error);
        }
      }

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
    [
      normalizeChapterValue,
      currentCharacter,
      activeComponent,
      playbackOnlyMode,
      wakeAnalytics,
    ],
  );

  const handleShowDotCompletion = useCallback(
    (options = {}) => {
      if (!selectedBook) return;
      void wakeAnalytics();
      setCompletedDotChapter(selectedChapter);
      if (options.openVocabularyGame) {
        setActiveComponent("vocabulary-game");
        return;
      }
      setActiveComponent(
        testingMode
          ? "dot-complete"
          : isDemoSession
            ? "demo-subscribe"
            : "dot-complete",
      );
    },
    [selectedBook, selectedChapter, isDemoSession, testingMode, wakeAnalytics],
  );

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
    if (activeComponent === "interactive" && talkDisconnectRef.current) {
      console.log("🔌 Triggering disconnect from navigation");
      try {
        await talkDisconnectRef.current();
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
    isInteractiveView && selectedBook && currentCharacter && !playbackOnlyMode;

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

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [isInteractiveView, mainRef]);

  useEffect(() => {
    if (activeComponent === "circle" || isInteractiveView) return;
    const saved = scrollPositionsRef.current[activeComponent];
    if (typeof saved === "number") {
      window.scrollTo({ top: saved, left: 0, behavior: "auto" });
    }
  }, [activeComponent, isInteractiveView]);

  const handleLandingContinue = () => {
    setActiveComponent(testingMode ? "first-circle-intro" : "onboarding");
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "landing":
        return (
          <LandingPage
            onContinue={handleLandingContinue}
            studentId={resolvedStudentId}
            studentName={student?.name ?? userName}
          />
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
          <BrowsePage
            userName={userName}
            studentId={resolvedStudentId}
            onOpenCircle={openCirclePage}
            onPlayEpisode={handlePlayEpisode}
          />
        );
      case "library":
        return (
          <BrowsePage
            userName={userName}
            studentId={resolvedStudentId}
            collapseHeroSignal={libraryHeroCollapseSignal}
            onOpenCircle={openCirclePage}
            onPlayEpisode={handlePlayEpisode}
            showContinueRow={false}
          />
        );
      case "circle":
        if (!selectedBook) {
          return (
            <BrowsePage
              userName={userName}
              studentId={resolvedStudentId}
              collapseHeroSignal={libraryHeroCollapseSignal}
              onOpenCircle={openCirclePage}
              onPlayEpisode={handlePlayEpisode}
              showContinueRow={false}
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
          <ProgressSectionV3
            conversationId={latestConversationId || undefined}
            userName={userName}
          />
        );
      case "dot-complete":
        if (!selectedBook) {
          return (
            <BrowsePage
              userName={userName}
              studentId={resolvedStudentId}
              collapseHeroSignal={libraryHeroCollapseSignal}
              onOpenCircle={openCirclePage}
              onPlayEpisode={handlePlayEpisode}
              showContinueRow={false}
            />
          );
        }
        return (
          <DotCompletionPage
            book={selectedBook}
            userName={userName}
            completedEpisode={completedDotChapter || selectedChapter || 1}
            onPreviewNextDot={handlePreviewNextDotFromCompletion}
            onOpenProgress={() => setActiveComponent("progress")}
            testingMode={testingMode}
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
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
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
          <InteractiveVoiceSession
            clientKey={connectionKey}
            transportType={transportType}
            shouldStartSession={shouldStartSession}
            updatedBotConfig={updatedBotConfig}
            userName={userName}
            studentId={resolvedStudentId}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            selectedDotTitle={selectedDotTitle}
            currentCharacter={currentCharacter}
            region={region}
            talkDisconnectRef={talkDisconnectRef}
            managerDisconnectRef={managerDisconnectRef}
            shouldShowConnectionManager={shouldShowConnectionManager}
            setShouldStartSession={setShouldStartSession}
            handleNavigationClick={handleNavigationClick}
            handleShowDotCompletion={handleShowDotCompletion}
            previewScreen={previewConfig?.screen ?? null}
            trackUsageEvent={trackUsageEvent}
            suppressSessionBootstrap={playbackOnlyMode}
          />
        );
      default:
        return (
          <LandingPage
            studentId={resolvedStudentId}
            studentName={student?.name ?? userName}
          />
        );
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
          ? "bg-[#4F415F]"
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
  const shouldShowBottomNav =
    activeComponent !== "landing" &&
    activeComponent !== "onboarding" &&
    activeComponent !== "first-circle-intro" &&
    activeComponent !== "demo-subscribe" &&
    activeComponent !== "interactive";
  const navMode =
    isInteractiveView || activeComponent === "circle" ? "back" : "navigation";
  const shouldRenderFloatingNav = shouldShowBottomNav && !testingMode;
  const testingSurveyId =
    getQueryParam("surveyId") || import.meta.env.VITE_TESTING_SURVEY_ID || "";
  const testingSurveyUrl = testingSurveyId
    ? `https://form.typeform.com/to/${testingSurveyId}#user_id=${encodeURIComponent(
        resolvedStudentId || "",
      )}`
    : "";
  const handleFloatingNavBack = () => {
    if (isInteractiveView) {
      handleNavigationClick("circle");
      return;
    }
    handleNavigationClick("library");
  };

  return (
    <div
      className={`app-mobile-shell ${screenshotMode ? "app-screenshot-shell" : ""} ${desktopIpadFrame ? "desktop-ipad-frame-shell" : ""} ${characterBgClass}`}
      data-testing-mode={testingMode ? "true" : "false"}
      data-desktop-ipad-frame={desktopIpadFrame ? "true" : "false"}
      style={appShellStyle}
    >
      <Layout
        mainRef={mainRef}
        disableScroll={isInteractiveView}
        screenshotMode={screenshotMode}
        withBottomNav={shouldShowBottomNav}
        fullHeight={
          activeComponent === "vocabulary-game" || activeComponent === "parents"
        }
        mainClassName={mainBackgroundClass}
      >
        {activeComponent === "landing" ? (
          renderComponent()
        ) : (
          <div className={isInteractiveView ? "h-full min-h-0" : ""}>
            {renderComponent()}
          </div>
        )}
      </Layout>
      {shouldRenderFloatingNav && (
        <BottomNavBar
          onItemClick={handleNavigationClick}
          onBackClick={handleFloatingNavBack}
          scrollContainerRef={mainRef}
          orientation="horizontal"
          mode={navMode}
          activeComponentName={
            activeComponent === "first-circle-intro" ||
            activeComponent === "dot-complete" ||
            activeComponent === "demo-subscribe"
              ? "library"
              : activeComponent
          }
          className={`${screenshotMode ? "screenshot-mode-bottom-nav" : ""} ${isInteractiveView ? "backdrop-blur-sm" : ""}`.trim()}
        />
      )}
      {activeComponent === "progress" && testingSurveyUrl ? (
        <div
          className={`z-[95] ${
            desktopIpadFrame
              ? "absolute bottom-4 left-4 right-4"
              : "fixed bottom-5 left-5 right-5"
          }`}
          style={
            desktopIpadFrame
              ? undefined
              : { bottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }
          }
        >
          <SurveyCtaButton
            href={testingSurveyUrl}
            className="block w-full min-h-[3.9rem] flex items-center justify-center rounded-full bg-white px-6 py-3 text-center text-base font-black uppercase tracking-[0.04em] text-[#2A1F11] shadow-[0_20px_44px_rgba(0,0,0,0.42),0_8px_18px_rgba(0,0,0,0.3)] hover:brightness-[0.98] active:scale-[0.98]"
          />
        </div>
      ) : null}
      {portraitBlocked && <PortraitOrientationBlocker />}
    </div>
  );
};

export default App;
