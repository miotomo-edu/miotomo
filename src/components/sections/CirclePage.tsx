import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Book } from "./LibrarySection";
import { supabase } from "../../hooks/integrations/supabase/client";
import { useBooks } from "../../hooks/useBooks";
import { useCircleCover } from "../../hooks/useCircleCover";
import { useBrowseCircles } from "../../hooks/useBrowseCircles";
import CircleCard from "../features/browse/CircleCard";
import WelcomeSection from "./WelcomeSection";

type CirclePageProps = {
  book: Book;
  studentId: string;
  userName: string;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  onBack: () => void;
  onPlayEpisode: (book: Book, episode: number, dotTitle?: string) => void;
  onSelectCircle?: (book: Book, chapter: number) => void;
};

type EpisodeMeta = {
  episode: number;
  title: string | null;
};

const normalizeTag = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

const toTagList = (value: string[] | string | null | undefined) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((tag) => normalizeTag(String(tag))).filter(Boolean);
  }
  return value
    .split(",")
    .map((tag) => normalizeTag(tag))
    .filter(Boolean);
};

const CirclePage: React.FC<CirclePageProps> = ({
  book,
  studentId,
  userName,
  scrollContainerRef,
  onBack,
  onPlayEpisode,
  onSelectCircle,
}) => {
  const [titlesByEpisode, setTitlesByEpisode] = useState<
    Record<number, string>
  >({});
  const [durationsByEpisode, setDurationsByEpisode] = useState<
    Record<number, number>
  >({});
  const [levelsByEpisode, setLevelsByEpisode] = useState<
    Record<number, number>
  >({});
  const [typeNamesByEpisode, setTypeNamesByEpisode] = useState<
    Record<number, string>
  >({});
  const [dotStatusByEpisode, setDotStatusByEpisode] = useState<
    Record<
      number,
      {
        listening_status?: string | null;
        elapsed_listening_seconds?: number | null;
        talking_status?: string | null;
      }
    >
  >({});
  const [headerScale, setHeaderScale] = useState(1);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { updateBookProgress, isUpdating } = useBooks(studentId);
  const coverUrl = useCircleCover(book.thumbnailUrl);
  const { data: browseData } = useBrowseCircles(studentId);
  const progressDot = Math.max(book?.progress ?? 1, 1);

  useEffect(() => {
    const target =
      scrollContainerRef?.current instanceof HTMLElement
        ? scrollContainerRef.current
        : window;
    if (target && "scrollTo" in target) {
      target.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } else if (target instanceof HTMLElement) {
      target.scrollTop = 0;
    }
  }, [scrollContainerRef, book?.id]);

  useEffect(() => {
    let isCancelled = false;

    const loadEpisodeTitles = async () => {
      if (!book?.id) return;
      setIsLoading(true);
      setLoadError(null);
      setTitlesByEpisode({});
      setDurationsByEpisode({});
      setLevelsByEpisode({});
      setTypeNamesByEpisode({});
      setDotStatusByEpisode({});
      try {
        const { data, error } = await supabase
          .from("circles_dots")
          .select("episode, title, duration, type, level, created_at")
          .eq("circle_id", book.id)
          .order("created_at", { ascending: false });

        if (isCancelled) return;

        if (error) {
          setLoadError("Failed to load episodes.");
          console.warn("Failed to load episodes:", error);
          return;
        }

        const episodeEntries = new Map<
          number,
          {
            title: string | null;
            duration: number | string | null;
            type: number | string | null;
            level: number | string | null;
          }
        >();
        (data ?? []).forEach((row) => {
          const episodeNumber = Number(row.episode);
          if (!Number.isFinite(episodeNumber)) return;
          if (episodeEntries.has(episodeNumber)) return;
          episodeEntries.set(episodeNumber, {
            title: row.title ?? null,
            duration: row.duration ?? null,
            type: row.type ?? null,
            level: row.level ?? null,
          });
        });

        const titleMap: Record<number, string> = {};
        const durationMap: Record<number, number> = {};
        const levelMap: Record<number, number> = {};
        const typeIds = new Set();

        episodeEntries.forEach((row, episodeNumber) => {
          const title =
            typeof row.title === "string" && row.title.trim().length > 0
              ? row.title.trim()
              : null;
          if (title) {
            titleMap[episodeNumber] = title;
          }
          const durationValue = Number(row.duration);
          if (Number.isFinite(durationValue) && durationValue > 0) {
            durationMap[episodeNumber] = durationValue;
          }
          const levelValue = Number(row.level);
          if (Number.isFinite(levelValue)) {
            levelMap[episodeNumber] = levelValue;
          }
          const typeId = Number(row.type);
          if (Number.isFinite(typeId) && typeId > 0) {
            typeIds.add(typeId);
          }
        });

        const typeNameMap: Record<number, string> = {};
        if (typeIds.size > 0) {
          const { data: typeData, error: typeError } = await supabase
            .from("dots_type")
            .select("id, name")
            .in("id", Array.from(typeIds));
          if (typeError) {
            console.warn("Failed to load dots type names:", typeError);
          } else {
            (typeData ?? []).forEach((row) => {
              const idValue = Number(row.id);
              if (!Number.isFinite(idValue)) return;
              if (typeof row.name !== "string") return;
              const name = row.name.trim();
              if (name.length === 0) return;
              typeNameMap[idValue] = name;
            });
          }
        }

        const typeByEpisode: Record<number, string> = {};
        episodeEntries.forEach((row, episodeNumber) => {
          const typeId = Number(row.type);
          if (!Number.isFinite(typeId) || typeId <= 0) return;
          const name = typeNameMap[typeId];
          if (name) {
            typeByEpisode[episodeNumber] = name;
          }
        });

        setTitlesByEpisode(titleMap);
        setDurationsByEpisode(durationMap);
        setLevelsByEpisode(levelMap);
        setTypeNamesByEpisode(typeByEpisode);
      } catch (err) {
        if (isCancelled) return;
        setLoadError("Failed to load episodes.");
        console.warn("Failed to load episodes:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadEpisodeTitles();

    return () => {
      isCancelled = true;
    };
  }, [book?.id]);

  useEffect(() => {
    let isCancelled = false;
    const loadDotProgress = async () => {
      if (!studentId || !book?.id) return;
      try {
        const { data, error } = await supabase
          .from("dot_progress")
          .select(
            "episode, listening_status, talking_status, elapsed_listening_seconds",
          )
          .eq("student_id", studentId)
          .eq("book_id", book.id);
        if (isCancelled) return;
        if (error) {
          console.warn("Failed to load dot progress:", error);
          return;
        }
        const statusMap: Record<
          number,
          {
            listening_status?: string | null;
            talking_status?: string | null;
            elapsed_listening_seconds?: number | null;
          }
        > = {};
        (data ?? []).forEach((row) => {
          const episodeNumber = Number(row.episode);
          if (!Number.isFinite(episodeNumber)) return;
          statusMap[episodeNumber] = {
            listening_status: row.listening_status ?? null,
            talking_status: row.talking_status ?? null,
            elapsed_listening_seconds:
              typeof row.elapsed_listening_seconds === "number"
                ? row.elapsed_listening_seconds
                : null,
          };
        });
        setDotStatusByEpisode(statusMap);
      } catch (err) {
        if (isCancelled) return;
        console.warn("Failed to load dot progress:", err);
      }
    };

    loadDotProgress();

    return () => {
      isCancelled = true;
    };
  }, [studentId, book?.id]);

  useEffect(() => {
    const target =
      scrollContainerRef?.current instanceof HTMLElement
        ? scrollContainerRef.current
        : window;
    let rafId = null;

    const updateScale = () => {
      rafId = null;
      const scrollTop = target === window ? window.scrollY : target.scrollTop;
      const progress = Math.min(scrollTop / 360, 1);
      const nextScale = 1 + progress * 0.25;
      const nextOffset = scrollTop * 0.2;
      setHeaderScale((prev) =>
        Math.abs(prev - nextScale) < 0.001 ? prev : nextScale,
      );
      setHeaderOffset((prev) =>
        Math.abs(prev - nextOffset) < 0.5 ? prev : nextOffset,
      );
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateScale);
    };

    handleScroll();
    target.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      target.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainerRef]);

  const episodeCount = Math.max(Number(book.chapters) || 0, 0);
  const episodes = useMemo<EpisodeMeta[]>(() => {
    if (!episodeCount) return [];
    return Array.from({ length: episodeCount }, (_, idx) => {
      const episode = idx + 1;
      return {
        episode,
        title: titlesByEpisode[episode] ?? null,
      };
    });
  }, [episodeCount, titlesByEpisode]);

  const completedDots = useMemo(
    () =>
      episodes.filter(
        (episode) =>
          dotStatusByEpisode[episode.episode]?.talking_status === "completed",
      ),
    [episodes, dotStatusByEpisode],
  );

  const handlePlay = (episode: number) => {
    if (studentId && book?.id) {
      updateBookProgress({
        studentId,
        bookId: book.id,
        progress: episode,
      });
    }
    const resolvedTitle = titlesByEpisode[episode] ?? "";
    onPlayEpisode(book, episode, resolvedTitle || undefined);
  };

  const formatDuration = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return "--:--";
    const totalSeconds = Math.floor(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const completedBookIds = useMemo(() => {
    const ids = new Set<string>();
    (browseData?.progressRows ?? []).forEach((row) => {
      if (row.book_id && row.talking_status === "completed") {
        ids.add(row.book_id);
      }
    });
    return ids;
  }, [browseData?.progressRows]);

  const newBookIds = useMemo(() => {
    const ids = new Set<string>();
    (browseData?.circles ?? []).forEach((circle) => {
      if (!circle.catalog?.is_new) return;
      if (completedBookIds.has(circle.id)) return;
      ids.add(circle.id);
    });
    return ids;
  }, [browseData?.circles, completedBookIds]);

  const getBadgeForBook = useCallback(
    (bookId: string) => {
      if (completedBookIds.has(bookId)) return "REPLAY";
      if (newBookIds.has(bookId)) return "NEW";
      return undefined;
    },
    [completedBookIds, newBookIds],
  );

  const relatedItems = useMemo(() => {
    if (!browseData?.circles || !book?.id) return [];
    const current = browseData.circles.find((circle) => circle.id === book.id);
    if (!current?.catalog) return [];
    const currentTags = new Set([
      ...toTagList(current.catalog.theme_tags),
      ...toTagList(current.catalog.mood_tags),
      ...toTagList(current.catalog.domain_tags),
    ]);
    if (currentTags.size === 0) return [];
    return browseData.circles
      .filter((circle) => circle.id !== book.id)
      .filter((circle) => !completedBookIds.has(circle.id))
      .map((circle) => {
        const tags = [
          ...toTagList(circle.catalog?.theme_tags),
          ...toTagList(circle.catalog?.mood_tags),
          ...toTagList(circle.catalog?.domain_tags),
        ];
        const score = tags.reduce(
          (acc, tag) => acc + (currentTags.has(tag) ? 1 : 0),
          0,
        );
        if (score <= 0) return null;
        return { circle, score };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.circle.title.localeCompare(b.circle.title);
      })
      .slice(0, 6)
      .map(({ circle }) => ({
        book: circle,
        totalDots: circle.chapters ?? 0,
        chapter: Math.max(circle.progress || 1, 1),
        badge: getBadgeForBook(circle.id),
        completedDots:
          getBadgeForBook(circle.id) === "REPLAY"
            ? (circle.chapters ?? 0)
            : undefined,
        highlightCompleted: getBadgeForBook(circle.id) === "REPLAY",
      }));
  }, [browseData?.circles, book?.id, getBadgeForBook]);

  const differentItems = useMemo(() => {
    if (!browseData?.circles || !book?.id) return [];
    const current = browseData.circles.find((circle) => circle.id === book.id);
    if (!current?.catalog) return [];
    const currentTags = new Set([
      ...toTagList(current.catalog.theme_tags),
      ...toTagList(current.catalog.mood_tags),
      ...toTagList(current.catalog.domain_tags),
    ]);
    if (currentTags.size === 0) return [];
    const scored = browseData.circles
      .filter((circle) => circle.id !== book.id)
      .map((circle) => {
        const tags = [
          ...toTagList(circle.catalog?.theme_tags),
          ...toTagList(circle.catalog?.mood_tags),
          ...toTagList(circle.catalog?.domain_tags),
        ];
        const score = tags.reduce(
          (acc, tag) => acc + (currentTags.has(tag) ? 1 : 0),
          0,
        );
        return { circle, score };
      });
    const zeroOverlap = scored.filter((entry) => entry.score === 0);
    const candidates =
      zeroOverlap.length > 0
        ? zeroOverlap
        : scored.filter((entry) => entry.score === 1);
    return candidates
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return a.circle.title.localeCompare(b.circle.title);
      })
      .slice(0, 6)
      .map(({ circle }) => ({
        book: circle,
        totalDots: circle.chapters ?? 0,
        chapter: Math.max(circle.progress || 1, 1),
        badge: getBadgeForBook(circle.id),
        completedDots:
          getBadgeForBook(circle.id) === "REPLAY"
            ? (circle.chapters ?? 0)
            : undefined,
        highlightCompleted: getBadgeForBook(circle.id) === "REPLAY",
      }));
  }, [browseData?.circles, book?.id, getBadgeForBook]);

  const continueItems = useMemo(() => {
    if (!browseData?.circles || !browseData?.progressRows) return [];
    const activeRows = browseData.progressRows.filter((row) => {
      const listening = row.listening_status ?? "not_started";
      const talking = row.talking_status ?? "not_started";
      if (talking === "completed") return false;
      return (
        ["paused", "in_progress"].includes(listening) ||
        ["paused", "in_progress"].includes(talking)
      );
    });

    const completedByBook = new Map<string, number>();
    browseData.progressRows.forEach((row) => {
      if (!row.book_id) return;
      if (row.talking_status !== "completed") return;
      const episode = Number(row.episode ?? 0);
      if (!Number.isFinite(episode) || episode <= 0) return;
      const existing = completedByBook.get(row.book_id) ?? 0;
      if (episode > existing) {
        completedByBook.set(row.book_id, episode);
      }
    });

    const byBook = new Map<string, (typeof activeRows)[0]>();
    activeRows.forEach((row) => {
      if (!row.book_id) return;
      const existing = byBook.get(row.book_id);
      if (!existing) {
        byBook.set(row.book_id, row);
        return;
      }
      const existingTime = Date.parse(existing.last_active_at ?? "");
      const nextTime = Date.parse(row.last_active_at ?? "");
      if (Number.isNaN(existingTime) || nextTime > existingTime) {
        byBook.set(row.book_id, row);
      }
    });

    return Array.from(byBook.entries())
      .map(([bookId, row]) => {
        const match = browseData.circles.find((circle) => circle.id === bookId);
        if (!match) return null;
        if (match.id === book.id) return null;
        const episode = Number(row.episode ?? 1);
        return {
          book: match,
          chapter: episode,
          totalDots: match.chapters ?? 0,
          completedDots: completedByBook.get(bookId) ?? 0,
          highlightCompleted: true,
          pausedDotIndex:
            row.listening_status === "paused" || row.talking_status === "paused"
              ? episode
              : undefined,
          badge: "Continue",
        };
      })
      .filter(Boolean);
  }, [browseData?.circles, browseData?.progressRows, book?.id]);

  const formatStatus = (episode: number) => {
    const status = dotStatusByEpisode[episode];
    if (!status) return "Not started";
    const talking = status.talking_status;
    const listening = status.listening_status;
    if (talking && talking !== "not_started") {
      return `Talking ${talking.replace("_", " ")}`;
    }
    if (listening && listening !== "not_started") {
      const listenedSeconds =
        typeof status.elapsed_listening_seconds === "number"
          ? Math.max(status.elapsed_listening_seconds, 0)
          : 0;
      const durationSeconds =
        typeof durationsByEpisode[episode] === "number"
          ? durationsByEpisode[episode]
          : null;
      if (listening === "paused" || listening === "in_progress") {
        if (durationSeconds && durationSeconds > 0) {
          const remaining = Math.max(
            0,
            Math.ceil(durationSeconds - listenedSeconds),
          );
          return `Listening paused · remaining ${formatDuration(remaining)}`;
        }
        return `Listening paused · ${formatDuration(listenedSeconds)}`;
      }
      return `Listening ${listening.replace("_", " ")}`;
    }
    return "Not started";
  };

  const getComplexityStyle = useCallback((level: number | null) => {
    if (level === 1) {
      return {
        line: "bg-green-500",
        border: "border-green-500",
      };
    }
    if (level === 2) {
      return {
        line: "bg-yellow-500",
        border: "border-yellow-500",
      };
    }
    if (level === 3) {
      return {
        line: "bg-red-500",
        border: "border-red-500",
      };
    }
    return {
      line: "bg-black/40",
      border: "border-black/40",
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-library">
      <div className="w-full bg-library">
        <WelcomeSection userName={userName} />
      </div>
      <header
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "80vh" }}
      >
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full will-change-transform"
            style={{
              backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: coverUrl ? undefined : "#f3f4f6",
              transform: `translateY(${headerOffset}px) scale(${headerScale})`,
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-20 flex h-full flex-col px-6 py-6">
          <div className="flex items-start">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 transition-colors duration-200 ease-in-out hover:bg-white"
              aria-label="Back"
              type="button"
              style={{ flexShrink: 0 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.8327 10L4.16602 10.0003L9.99935 4.16699L4.16602 10.0003L9.99935 15.8337"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="mt-auto flex flex-col items-start gap-2 pb-16 text-white">
            <h1
              className="text-left text-6xl font-bold md:text-6xl"
              style={{ textShadow: "0 6px 14px rgba(0,0,0,1)" }}
            >
              {book.title}
            </h1>
          </div>
        </div>
      </header>

      <section className="relative z-10 -mt-16 bg-library px-6 pb-24 pt-8">
        <div className="flex items-center justify-between">
          {isLoading && (
            <span className="text-sm text-gray-500 md:text-base">
              Loading...
            </span>
          )}
        </div>
        {loadError && (
          <div className="mt-3 text-sm text-red-600">{loadError}</div>
        )}
        {!episodeCount && (
          <div className="mt-4 text-sm text-gray-500">
            No episodes available yet.
          </div>
        )}
        <div className="mt-4 flex flex-col">
          {episodes.map((episode, index) => {
            const title = episode.title || `Dot ${episode.episode}`;
            const typeName = typeNamesByEpisode[episode.episode] || "";
            const durationValue = durationsByEpisode[episode.episode];
            const progressStatus = dotStatusByEpisode[episode.episode];
            const hasStarted =
              (progressStatus?.listening_status &&
                progressStatus.listening_status !== "not_started") ||
              (progressStatus?.talking_status &&
                progressStatus.talking_status !== "not_started");
            const playLabel = hasStarted ? "Resume" : "Play";
            const levelValue = Number(levelsByEpisode[episode.episode]);
            const complexityStyle = getComplexityStyle(
              Number.isFinite(levelValue) ? levelValue : null,
            );
            return (
              <React.Fragment key={episode.episode}>
                <div className="flex w-full min-h-[88px] items-start justify-between px-1 py-0 md:min-h-[120px]">
                  <div className="flex items-start gap-4">
                    <div className="relative flex w-8 shrink-0 flex-col items-center self-stretch md:w-12">
                      <span
                        className={`flex-1 w-[2px] ${complexityStyle.line} ${index === 0 ? "opacity-0" : "opacity-100"}`}
                      />
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${complexityStyle.border} bg-white text-sm font-semibold text-black aspect-square md:h-12 md:w-12 md:text-lg`}
                      >
                        {episode.episode}
                      </div>
                      <span
                        className={`flex-1 w-[2px] ${complexityStyle.line} ${index === episodes.length - 1 ? "opacity-0" : "opacity-100"}`}
                      />
                    </div>
                    <div className="py-4 md:py-6">
                      <div className="text-base font-semibold text-black md:text-2xl">
                        {title}
                      </div>
                      {typeName && (
                        <div className="text-sm text-gray-500 md:text-lg">
                          {typeName}
                        </div>
                      )}
                      {Number.isFinite(durationValue) && durationValue > 0 && (
                        <div className="text-sm text-gray-600 md:text-lg">
                          {formatDuration(durationValue)}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 md:text-lg">
                        {formatStatus(episode.episode)}
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => handlePlay(episode.episode)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800 hover:bg-gray-300 disabled:cursor-not-allowed md:px-5 md:py-2 md:text-lg"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            className="h-4 w-4 md:h-5 md:w-5"
                            fill="currentColor"
                          >
                            <path d="M4 2.5v11l9-5.5-9-5.5z" />
                          </svg>
                          {playLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" />
                </div>
                {index < episodes.length - 1 && (
                  <div className="h-px w-full bg-black/10" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {continueItems.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-black">Continue</h3>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {continueItems.map((item) => (
                <CircleCard
                  key={`continue-${item.book.id}`}
                  book={item.book}
                  badge={item.badge}
                  totalDots={item.totalDots}
                  completedDots={item.completedDots}
                  highlightCompleted={item.highlightCompleted}
                  pausedDotIndex={item.pausedDotIndex}
                  onSelect={() => onSelectCircle?.(item.book, item.chapter)}
                />
              ))}
            </div>
          </div>
        )}
        {relatedItems.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-black">
              You might also like
            </h3>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {relatedItems.map((item) => (
                <CircleCard
                  key={`related-${item.book.id}`}
                  book={item.book}
                  badge={item.badge}
                  totalDots={item.totalDots}
                  completedDots={item.completedDots}
                  highlightCompleted={item.highlightCompleted}
                  onSelect={() => onSelectCircle?.(item.book, item.chapter)}
                />
              ))}
            </div>
          </div>
        )}
        {differentItems.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-black">
              Try something different
            </h3>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {differentItems.map((item) => (
                <CircleCard
                  key={`different-${item.book.id}`}
                  book={item.book}
                  badge={item.badge}
                  totalDots={item.totalDots}
                  completedDots={item.completedDots}
                  highlightCompleted={item.highlightCompleted}
                  onSelect={() => onSelectCircle?.(item.book, item.chapter)}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CirclePage;
