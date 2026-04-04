import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Book } from "./LibrarySection";
import { supabase } from "../../hooks/integrations/supabase/client";
import { useBooks } from "../../hooks/useBooks";
import { useCircleCover } from "../../hooks/useCircleCover";
import { useBrowseCircles } from "../../hooks/useBrowseCircles";
import CircleCard from "../features/browse/CircleCard";
import CircleDotsSymbol from "../features/browse/CircleDotsSymbol";
import WelcomeSection from "./WelcomeSection";
import { VocabularyIcon } from "../common/icons/VocabularyIcon";
import { StarIcon } from "../common/icons/StarIcon";

type CirclePageProps = {
  book: Book;
  studentId: string;
  userName: string;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  onBack: () => void;
  onPlayEpisode: (
    book: Book,
    episode: number,
    dotTitle?: string,
    dotTypeSlug?: string,
  ) => void;
  onSelectCircle?: (book: Book, chapter: number) => void;
};

type EpisodeMeta = {
  episode: number;
  title: string | null;
};

type NextDotCardProps = {
  episode: number;
  totalDots: number;
  completedDots: number;
  title: string;
  typeName?: string;
  typeSlug?: string;
  vocabulary?: boolean;
  durationLabel?: string;
  onPlay: () => void;
};

type DotTag = {
  icon:
    | "listen"
    | "talk"
    | "vocabulary"
    | "teach"
    | "debate"
    | "spelling"
    | "generic";
  label: string;
};

const getPrimaryActionLabel = (hasStarted?: boolean) =>
  hasStarted ? "Keep going" : "Start here";

const LineTagIcon: React.FC<{
  icon: DotTag["icon"];
  className?: string;
}> = ({ icon, className }) => {
  const sharedProps = {
    className,
    "aria-hidden": true,
  };

  switch (icon) {
    case "talk":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...sharedProps}>
          <path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.96 9.96 0 0 0 12 22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "vocabulary":
      return <VocabularyIcon {...sharedProps} />;
    case "generic":
      return <StarIcon {...sharedProps} />;
    case "listen":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...sharedProps}>
          <path
            d="M4 13a8 8 0 0 1 16 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="3.5"
            y="12"
            width="4"
            height="7"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <rect
            x="16.5"
            y="12"
            width="4"
            height="7"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "teach":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...sharedProps}>
          <path
            d="M11.5 4.5h8v8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.75 9.2a2.2 2.2 0 1 0 0-4.4a2.2 2.2 0 0 0 0 4.4Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.9 18.8v-5.1c0-1.6 1.1-2.8 2.6-2.8c1 0 1.8.3 2.5 1l1.9 1.8h2.7l2.4-3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 13.2v5.6M10 18.8v-4.3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "debate":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...sharedProps}>
          <line
            x1="19.7344"
            y1="3.5142"
            x2="2.7639"
            y2="20.4848"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <line
            x1="5.6353"
            y1="13.8105"
            x2="9.4386"
            y2="17.6138"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <line
            x1="2.7642"
            y1="3.5156"
            x2="19.7348"
            y2="20.4861"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <line
            x1="13.0605"
            y1="17.6147"
            x2="16.8638"
            y2="13.8114"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "spelling":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...sharedProps}>
          <path
            d="M5 18.5h4l8.5-8.5a1.8 1.8 0 0 0-4-4L5 14.5v4Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 7.5l4 4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

const getDotTags = (
  typeSlug?: string,
  typeName?: string,
  vocabulary?: boolean,
): DotTag[] => {
  switch (typeSlug) {
    case "teachtime":
      return [
        {
          icon: "teach",
          label: (typeName || "Teach time with Tomo").toUpperCase(),
        },
      ];
    case "debating":
      return [
        { icon: "debate", label: (typeName || "Take a side").toUpperCase() },
      ];
    case "vocabulary":
      return [{ icon: "vocabulary", label: "WORD GAME" }];
    case "spelling":
      return [{ icon: "spelling", label: "SPELLING GAME" }];
    case "storytelling":
    case "mediation":
    case "talktime":
    default:
      if (
        typeName &&
        !["storytelling", "mediation", "talktime"].includes(typeSlug || "")
      ) {
        return [{ icon: "generic", label: typeName.toUpperCase() }];
      }
      return [
        { icon: "listen", label: "LISTEN FIRST" },
        { icon: "talk", label: "TALK WITH TOMO" },
        ...(vocabulary ? [{ icon: "vocabulary", label: "WORD GAME" }] : []),
      ];
  }
};

const NextDotCard: React.FC<NextDotCardProps> = ({
  episode,
  totalDots,
  completedDots,
  title,
  typeName,
  typeSlug,
  vocabulary,
  durationLabel,
  onPlay,
}) => {
  const tags = getDotTags(typeSlug, typeName, vocabulary);
  const primaryAction =
    completedDots > 0 ? `Keep going with Dot ${episode}` : `Start Dot ${episode}`;

  return (
    <section className="relative mb-8 overflow-hidden rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,#111111_0%,#181512_100%)] text-white shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
      <div className="px-5 pb-5 pt-5 md:px-7 md:pb-6 md:pt-6">
        <div className="flex items-center gap-3 text-lg font-medium text-white/78 md:text-xl">
          <span className="text-xl text-brand-primary" aria-hidden="true">
            ★
          </span>
          <span>Today&apos;s Mission</span>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <CircleDotsSymbol
              totalDots={totalDots}
              completedDots={completedDots}
              currentDot={episode}
              label={episode}
              size={56}
              ringColor="#ffffff"
              inactiveDotFill="#ffffff"
              inactiveDotStroke="#ffffff"
              completedDotFill="#FAC304"
              completedDotStroke="#FAC304"
              labelColor="#ffffff"
              className="shrink-0 self-start md:h-[68px] md:w-[68px]"
            />
            <div className="min-w-0">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">
                Today's mission
              </div>
              <div className="font-display text-3xl font-bold leading-[0.96] tracking-[-0.02em] md:text-4xl">
                {title}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/72 md:text-base">
                {tags.map((tag) => (
                  <span
                    key={`${episode}-${tag.label}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em]"
                  >
                    <LineTagIcon
                      icon={tag.icon}
                      className="h-[1.05em] w-[1.05em] shrink-0 text-white/85"
                    />
                    <span>{tag.label}</span>
                  </span>
                ))}
              </div>
              {durationLabel ? (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-white/72 md:text-base">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-[0.95em] w-[0.95em] shrink-0 text-white/85"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="13"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M12 13V9.8M12 13L14.5 14.6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.7 3.5h4.6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{durationLabel}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5 md:px-7 md:pb-6">
        <button
          type="button"
          onClick={onPlay}
          aria-label={`Play ${title}`}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-primary px-5 py-4 text-base font-semibold text-black shadow-glow-gold transition hover:scale-[1.01] md:w-auto"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="ml-0.5 h-5 w-5"
            fill="currentColor"
          >
            <path d="M4 2.5v11l9-5.5-9-5.5z" />
          </svg>
          <span>{primaryAction}</span>
        </button>
      </div>
    </section>
  );
};

const normalizeDotTypeSlug = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
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

const isWithinWindow = (start?: string | null, end?: string | null) => {
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

const CirclePage: React.FC<CirclePageProps> = ({
  book,
  studentId,
  userName,
  scrollContainerRef,
  onBack,
  onPlayEpisode,
  onSelectCircle,
}) => {
  const showRecommendationSections = false;
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
  const [typeSlugsByEpisode, setTypeSlugsByEpisode] = useState<
    Record<number, string>
  >({});
  const [vocabularyByEpisode, setVocabularyByEpisode] = useState<
    Record<number, boolean>
  >({});
  const [episodeNumbersFromDots, setEpisodeNumbersFromDots] = useState<
    number[]
  >([]);
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
  const [reloadKey, setReloadKey] = useState(0);
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
      setTypeSlugsByEpisode({});
      setVocabularyByEpisode({});
      setEpisodeNumbersFromDots([]);
      setDotStatusByEpisode({});
      try {
        const { data, error } = await supabase
          .from("circles_dots")
          .select(
            "episode, title, duration, type, level, vocabulary, created_at",
          )
          .eq("circle_id", book.id)
          .order("created_at", { ascending: false });

        if (isCancelled) return;

        if (error) {
          setLoadError("We couldn’t load this circle yet.");
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
            vocabulary: boolean;
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
            vocabulary: Boolean(row.vocabulary),
          });
        });

        const titleMap: Record<number, string> = {};
        const durationMap: Record<number, number> = {};
        const levelMap: Record<number, number> = {};
        const vocabularyMap: Record<number, boolean> = {};
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
          vocabularyMap[episodeNumber] = Boolean(row.vocabulary);
          const typeId = Number(row.type);
          if (Number.isFinite(typeId) && typeId > 0) {
            typeIds.add(typeId);
          }
        });

        const typeNameMap: Record<number, string> = {};
        const typeSlugMap: Record<number, string> = {};
        if (typeIds.size > 0) {
          const { data: typeData, error: typeError } = await supabase
            .from("dots_type")
            .select("id, name, slug")
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
              if (typeof row.slug === "string") {
                const slug = normalizeDotTypeSlug(row.slug);
                if (slug) {
                  typeSlugMap[idValue] = slug;
                }
              }
            });
          }
        }

        const typeByEpisode: Record<number, string> = {};
        const typeSlugByEpisode: Record<number, string> = {};
        episodeEntries.forEach((row, episodeNumber) => {
          const typeId = Number(row.type);
          if (!Number.isFinite(typeId) || typeId <= 0) return;
          const name = typeNameMap[typeId];
          if (name) {
            typeByEpisode[episodeNumber] = name;
          }
          const slug = typeSlugMap[typeId];
          if (slug) {
            typeSlugByEpisode[episodeNumber] = slug;
          }
        });

        setTitlesByEpisode(titleMap);
        setDurationsByEpisode(durationMap);
        setLevelsByEpisode(levelMap);
        setTypeNamesByEpisode(typeByEpisode);
        setTypeSlugsByEpisode(typeSlugByEpisode);
        setVocabularyByEpisode(vocabularyMap);
        setEpisodeNumbersFromDots(
          Array.from(episodeEntries.keys()).sort((a, b) => a - b),
        );
      } catch (err) {
        if (isCancelled) return;
        setLoadError("We couldn’t load this circle yet.");
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
  }, [book?.id, reloadKey]);

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

  const maxEpisodeFromDots = useMemo(
    () =>
      episodeNumbersFromDots.reduce((max, episode) => {
        if (episode > max) return episode;
        return max;
      }, 0),
    [episodeNumbersFromDots],
  );

  const episodeCount = Math.max(Number(book.chapters) || 0, maxEpisodeFromDots);
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

  const nextEpisode = useMemo(() => {
    const firstIncomplete = episodes.find(
      (episode) =>
        dotStatusByEpisode[episode.episode]?.talking_status !== "completed",
    );
    return firstIncomplete ?? episodes[0] ?? null;
  }, [episodes, dotStatusByEpisode]);

  const handlePlay = (episode: number) => {
    if (studentId && book?.id) {
      updateBookProgress({
        studentId,
        bookId: book.id,
        progress: episode,
      });
    }
    const resolvedTitle = titlesByEpisode[episode] ?? "";
    const resolvedTypeSlug = typeSlugsByEpisode[episode] ?? undefined;
    onPlayEpisode(book, episode, resolvedTitle || undefined, resolvedTypeSlug);
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

  const currentMissionBookId = useMemo(() => {
    const circles = browseData?.circles ?? [];
    if (!circles.length) return null;
    const featured = circles
      .filter((circle) => {
        if (!circle.catalog?.featured) return false;
        return isWithinWindow(
          circle.catalog?.featured_start,
          circle.catalog?.featured_end,
        );
      })
      .sort((a, b) => {
        const rankA = Number(
          a.catalog?.featured_rank ?? Number.POSITIVE_INFINITY,
        );
        const rankB = Number(
          b.catalog?.featured_rank ?? Number.POSITIVE_INFINITY,
        );
        if (rankA !== rankB) return rankA - rankB;
        const aPublished = Date.parse(a.catalog?.published_at ?? "");
        const bPublished = Date.parse(b.catalog?.published_at ?? "");
        if (!Number.isNaN(aPublished) && !Number.isNaN(bPublished)) {
          return bPublished - aPublished;
        }
        return 0;
      });
    return featured[0]?.id ?? circles[0]?.id ?? null;
  }, [browseData?.circles]);

  const shouldShowTodayMission =
    Boolean(nextEpisode) &&
    Boolean(currentMissionBookId) &&
    currentMissionBookId === book.id;

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
      return `Listening ${listening.replace("_", " ")}`;
    }
    return "Not started";
  };

  const completedDotCount = completedDots.length;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <div className="w-full bg-white px-6">
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,238,224,0)_0%,rgba(27,29,22,0.08)_42%,rgba(12,14,12,0.86)_100%)]" />
        <div className="relative z-20 flex h-full flex-col px-6 py-6">
          <div className="flex items-start">
            <button
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/14 text-white backdrop-blur-md transition-colors duration-200 ease-in-out hover:bg-white/22"
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
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="mt-auto flex flex-col items-start gap-2 pb-16 text-white">
            <h1
              className="font-display text-left text-5xl font-bold leading-[1.02] md:text-5xl"
              style={{ textShadow: "0 6px 14px rgba(0,0,0,1)" }}
            >
              {book.title}
            </h1>
            {nextEpisode ? (
              <div className="rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
                {`${getPrimaryActionLabel(
                  Boolean(
                    dotStatusByEpisode[nextEpisode.episode]?.listening_status &&
                      dotStatusByEpisode[nextEpisode.episode]
                        ?.listening_status !== "not_started",
                  ) ||
                    Boolean(
                      dotStatusByEpisode[nextEpisode.episode]?.talking_status &&
                        dotStatusByEpisode[nextEpisode.episode]
                          ?.talking_status !== "not_started",
                    ),
                )}: Dot ${nextEpisode.episode}`}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="relative z-10 -mt-16 bg-white px-6 pb-24 pt-8">
        {isLoading ? (
          <div className="mb-6 rounded-[28px] border border-black/8 bg-[#f7f1e8] p-5 shadow-stage">
            <div className="h-4 w-32 animate-pulse rounded-full bg-black/10" />
            <div className="mt-4 h-8 w-48 animate-pulse rounded-full bg-black/12" />
            <div className="mt-5 h-12 w-full animate-pulse rounded-full bg-brand-primary/45" />
            <p className="mt-4 text-sm font-medium text-[#5d5345]">
              Getting this circle ready for you...
            </p>
          </div>
        ) : null}
        {loadError && (
          <div className="mt-3 rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p className="font-semibold text-red-900">{loadError}</p>
            <p className="mt-1 leading-relaxed">
              Try again to bring back your next mission.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-3 inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}
        {!episodeCount && (
          <div className="mt-4 rounded-[28px] border border-black/8 bg-[#f7f1e8] px-5 py-4 text-sm font-medium text-[#5d5345]">
            This circle is still getting its dots ready.
          </div>
        )}
        {shouldShowTodayMission && nextEpisode ? (
          <NextDotCard
            episode={nextEpisode.episode}
            totalDots={episodeCount}
            completedDots={completedDotCount}
            title={nextEpisode.title || `Dot ${nextEpisode.episode}`}
            typeName={typeNamesByEpisode[nextEpisode.episode] || undefined}
            durationLabel={(() => {
              const typeSlug = typeSlugsByEpisode[nextEpisode.episode];
              const durationValue = durationsByEpisode[nextEpisode.episode];
              if (typeSlug === "teachtime" || typeSlug === "debating") {
                return undefined;
              }
              return Number.isFinite(durationValue) && durationValue > 0
                ? formatDuration(durationValue)
                : undefined;
            })()}
            typeSlug={typeSlugsByEpisode[nextEpisode.episode] || undefined}
            vocabulary={vocabularyByEpisode[nextEpisode.episode]}
            onPlay={() => handlePlay(nextEpisode.episode)}
          />
        ) : null}
        <div className="mt-4 flex flex-col">
          {episodes.map((episode, index) => {
            const title = episode.title || `Dot ${episode.episode}`;
            const typeName = typeNamesByEpisode[episode.episode] || "";
            const typeSlug = typeSlugsByEpisode[episode.episode] || "";
            const durationValue = durationsByEpisode[episode.episode];
            const durationLabel =
              typeSlug !== "teachtime" &&
              typeSlug !== "debating" &&
              Number.isFinite(durationValue) &&
              durationValue > 0
                ? formatDuration(durationValue)
                : null;
            const tags = getDotTags(
              typeSlug || undefined,
              typeName || undefined,
              vocabularyByEpisode[episode.episode],
            );
            const progressStatus = dotStatusByEpisode[episode.episode];
            const isCompleted = progressStatus?.talking_status === "completed";
            const isCurrent =
              shouldShowTodayMission &&
              nextEpisode?.episode === episode.episode;
            const hasStarted =
              (progressStatus?.listening_status &&
                progressStatus.listening_status !== "not_started") ||
              (progressStatus?.talking_status &&
                progressStatus.talking_status !== "not_started");
            const showRowButton = isCompleted;
            const playLabel = isCompleted
              ? "Listen again"
              : hasStarted
                ? "Keep going"
                : "Start dot";
            const statusLabel = isCompleted
              ? "Done"
              : isCurrent
                ? getPrimaryActionLabel(hasStarted)
                : hasStarted
                  ? "In progress"
                  : "New";
            return (
              <React.Fragment key={episode.episode}>
                <div
                  className={`flex w-full items-start justify-between rounded-3xl px-4 py-4 transition md:px-5 md:py-5 ${
                    isCurrent
                      ? "bg-black text-white shadow-elevated"
                      : "bg-white/78 text-black"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <CircleDotsSymbol
                      totalDots={episodeCount}
                      completedDots={completedDotCount}
                      currentDot={episode.episode}
                      label={episode.episode}
                      size={52}
                      ringColor={isCurrent ? "#ffffff" : "#0a1024"}
                      inactiveDotFill={isCurrent ? "#ffffff" : "#0a1024"}
                      inactiveDotStroke={isCurrent ? "#ffffff" : "#0a1024"}
                      completedDotFill="#FAC304"
                      completedDotStroke="#FAC304"
                      labelColor={isCurrent ? "#ffffff" : "#0a1024"}
                      className="shrink-0 self-start md:h-[60px] md:w-[60px]"
                    />
                    <div className="py-1">
                      <div
                        className={`font-display text-2xl font-bold leading-tight ${
                          isCurrent ? "text-white" : "text-black"
                        }`}
                      >
                        {title}
                      </div>
                      <div
                        className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm ${
                          isCurrent ? "text-white/60" : "text-black/50"
                        }`}
                      >
                        {tags.map((tag) => (
                          <span
                            key={`${episode.episode}-${tag.label}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em]"
                          >
                            <LineTagIcon
                              icon={tag.icon}
                              className={`h-[1.05em] w-[1.05em] shrink-0 ${
                                isCurrent ? "text-white/85" : "text-black"
                              }`}
                            />
                            <span>{tag.label}</span>
                          </span>
                        ))}
                        {isCompleted ? (
                          <span className="font-semibold text-[#b07b00]">
                            {tags.length > 0 ? "· " : ""}
                            Completed
                          </span>
                        ) : null}
                        {!isCompleted ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                              isCurrent
                                ? "bg-white/14 text-white"
                                : "bg-[#f4ecdf] text-[#6b5843]"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        ) : null}
                      </div>
                      {durationLabel ? (
                        <div
                          className={`mt-1 flex items-center gap-1.5 text-sm ${
                            isCurrent ? "text-white/60" : "text-black/50"
                          }`}
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className={`h-[0.95em] w-[0.95em] shrink-0 ${
                              isCurrent ? "text-white/85" : "text-black"
                            }`}
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="13"
                              r="7"
                              stroke="currentColor"
                              strokeWidth="1.7"
                            />
                            <path
                              d="M12 13V9.8M12 13L14.5 14.6"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.7 3.5h4.6"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span>{durationLabel}</span>
                        </div>
                      ) : null}
                      {showRowButton ? (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => handlePlay(episode.episode)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-2 rounded-full bg-black/10 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-black/18 active:scale-[0.97] disabled:cursor-not-allowed md:px-5 md:text-base"
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 16 16"
                              className="h-4 w-4"
                              fill="currentColor"
                            >
                              <path d="M4 2.5v11l9-5.5-9-5.5z" />
                            </svg>
                            {playLabel}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3" />
                </div>
                {index < episodes.length - 1 && (
                  <div className="my-3 h-px w-full bg-black/8" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {continueItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-black">
              More to keep going
            </h2>
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
        {showRecommendationSections && relatedItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-black">
              You might also like
            </h2>
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
        {showRecommendationSections && differentItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-black">
              Try something different
            </h2>
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
