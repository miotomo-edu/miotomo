import React, { useEffect, useMemo, useState } from "react";
import type { Book } from "../../sections/LibrarySection";
import { useCircleCover } from "../../../hooks/useCircleCover";
import { supabase } from "../../../hooks/integrations/supabase/client";
import { useBooks } from "../../../hooks/useBooks";
import CircleDotsSymbol from "./CircleDotsSymbol";
import { VocabularyIcon } from "../../common/icons/VocabularyIcon";
import { StarIcon } from "../../common/icons/StarIcon";

type CurrentCircleHeroProps = {
  studentId: string;
  collapseSignal?: number;
  item: {
    book: Book;
    badge?: string;
    kicker?: string;
    totalDots?: number;
    completedDots?: number;
    currentDot?: number;
    nextDotTitle?: string;
    nextChapter?: number;
  };
  onOpenCircle: (book: Book, chapter: number) => void;
  showOpenCircle?: boolean;
  onPlay: (
    book: Book,
    episode: number,
    dotTitle?: string,
    dotTypeSlug?: string,
  ) => void;
};

type EpisodeStatus = {
  listening_status?: string | null;
  talking_status?: string | null;
  elapsed_listening_seconds?: number | null;
};

type EpisodeMeta = {
  episode: number;
  title: string | null;
  typeName?: string;
  typeSlug?: string;
  duration?: number;
  vocabulary?: boolean;
  status?: EpisodeStatus;
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

const normalizeDotTypeSlug = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
};

const formatDuration = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "--:--";
  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

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
      return [{ icon: "vocabulary", label: "VOCABULARY" }];
    case "spelling":
      return [{ icon: "spelling", label: "SPELLING" }];
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
        { icon: "listen", label: "LISTEN" },
        { icon: "talk", label: "TALK TIME" },
        ...(vocabulary ? [{ icon: "vocabulary", label: "VOCABULARY" }] : []),
      ];
  }
};

const CurrentCircleHero: React.FC<CurrentCircleHeroProps> = ({
  studentId,
  collapseSignal = 0,
  item,
  onOpenCircle,
  showOpenCircle = false,
  onPlay,
}) => {
  const coverUrl = useCircleCover(item.book.thumbnailUrl);
  const [isExpanded, setIsExpanded] = useState(false);
  const [episodes, setEpisodes] = useState<EpisodeMeta[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);
  const { updateBookProgress, isUpdating } = useBooks(studentId);

  const totalDots = Math.max(
    Number(item.totalDots) || 0,
    Number(item.book.chapters) || 0,
  );
  const completedDots = Math.max(Number(item.completedDots) || 0, 0);
  const progressDot =
    typeof item.currentDot === "number" && item.currentDot > 0
      ? item.currentDot
      : null;

  useEffect(() => {
    setIsExpanded(false);
  }, [collapseSignal]);

  useEffect(() => {
    let isCancelled = false;

    const loadEpisodes = async () => {
      if (!item.book.id) return;
      setIsLoadingEpisodes(true);
      setEpisodesError(null);

      try {
        const [dotsResult, progressResult] = await Promise.all([
          supabase
            .from("circles_dots")
            .select("episode, title, duration, type, vocabulary, created_at")
            .eq("circle_id", item.book.id)
            .order("created_at", { ascending: false }),
          studentId
            ? supabase
                .from("dot_progress")
                .select(
                  "episode, listening_status, talking_status, elapsed_listening_seconds",
                )
                .eq("student_id", studentId)
                .eq("book_id", item.book.id)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (isCancelled) return;
        if (dotsResult.error) throw dotsResult.error;
        if (progressResult.error) throw progressResult.error;

        const episodeEntries = new Map<
          number,
          {
            title: string | null;
            duration: number | null;
            typeId: number | null;
            vocabulary: boolean;
          }
        >();

        (dotsResult.data ?? []).forEach((row) => {
          const episodeNumber = Number(row.episode);
          if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) return;
          if (episodeEntries.has(episodeNumber)) return;
          episodeEntries.set(episodeNumber, {
            title:
              typeof row.title === "string" && row.title.trim().length > 0
                ? row.title.trim()
                : null,
            duration: Number.isFinite(Number(row.duration))
              ? Number(row.duration)
              : null,
            typeId: Number.isFinite(Number(row.type)) ? Number(row.type) : null,
            vocabulary: Boolean(row.vocabulary),
          });
        });

        const typeIds = Array.from(
          new Set(
            Array.from(episodeEntries.values())
              .map((entry) => entry.typeId)
              .filter(
                (value): value is number => Number.isFinite(value) && value > 0,
              ),
          ),
        );

        const typeMap = new Map<number, { name: string; slug?: string }>();
        if (typeIds.length > 0) {
          const { data: typeData, error: typeError } = await supabase
            .from("dots_type")
            .select("id, name, slug")
            .in("id", typeIds);

          if (typeError) {
            console.warn("Failed to load dots type names:", typeError);
          } else {
            (typeData ?? []).forEach((row) => {
              const idValue = Number(row.id);
              const nameValue =
                typeof row.name === "string" ? row.name.trim() : "";
              if (!Number.isFinite(idValue) || !nameValue) return;
              typeMap.set(idValue, {
                name: nameValue,
                slug: normalizeDotTypeSlug(row.slug) ?? undefined,
              });
            });
          }
        }

        const statusMap = new Map<number, EpisodeStatus>();
        (progressResult.data ?? []).forEach((row) => {
          const episodeNumber = Number(row.episode);
          if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) return;
          statusMap.set(episodeNumber, {
            listening_status: row.listening_status ?? null,
            talking_status: row.talking_status ?? null,
            elapsed_listening_seconds: row.elapsed_listening_seconds ?? null,
          });
        });

        const highestEpisode = Math.max(
          Number(item.book.chapters) || 0,
          ...Array.from(episodeEntries.keys()),
        );

        const nextEpisodes = Array.from(
          { length: Math.max(highestEpisode, 0) },
          (_, index) => {
            const episode = index + 1;
            const entry = episodeEntries.get(episode);
            const typeEntry = entry?.typeId
              ? typeMap.get(entry.typeId)
              : undefined;

            return {
              episode,
              title: entry?.title ?? null,
              typeName: typeEntry?.name,
              typeSlug: typeEntry?.slug,
              duration: entry?.duration ?? undefined,
              vocabulary: entry?.vocabulary ?? false,
              status: statusMap.get(episode),
            };
          },
        );

        setEpisodes(nextEpisodes);
      } catch (error) {
        if (isCancelled) return;
        console.warn("Failed to load hero episodes:", error);
        setEpisodesError("Could not load the full dot list.");
        setEpisodes([]);
      } finally {
        if (!isCancelled) {
          setIsLoadingEpisodes(false);
        }
      }
    };

    loadEpisodes();

    return () => {
      isCancelled = true;
    };
  }, [item.book.chapters, item.book.id, studentId]);

  const activeEpisodeNumber = useMemo(() => {
    if (typeof item.nextChapter === "number" && item.nextChapter > 0) {
      return item.nextChapter;
    }
    const firstIncomplete = episodes.find(
      (episode) => episode.status?.talking_status !== "completed",
    );
    return firstIncomplete?.episode ?? 1;
  }, [episodes, item.nextChapter]);

  const activeEpisode = useMemo(() => {
    return (
      episodes.find((episode) => episode.episode === activeEpisodeNumber) ??
      null
    );
  }, [activeEpisodeNumber, episodes]);

  const activeDotTitle =
    activeEpisode?.title?.trim() ||
    item.nextDotTitle?.trim() ||
    `Dot ${activeEpisodeNumber}`;
  const highlightedDot = progressDot ?? activeEpisodeNumber;

  const handlePlayEpisode = (
    episode: number,
    dotTitle?: string | null,
    dotTypeSlug?: string,
  ) => {
    if (studentId && item.book.id) {
      updateBookProgress({
        studentId,
        bookId: item.book.id,
        progress: episode,
      });
    }
    onPlay(item.book, episode, dotTitle || undefined, dotTypeSlug);
  };

  const handleHeroPlay = () => {
    handlePlayEpisode(
      activeEpisodeNumber,
      activeEpisode?.title ?? activeDotTitle,
      activeEpisode?.typeSlug,
    );
  };

  return (
    <section>
      <h1 className="font-display mb-7 text-3xl font-bold leading-none md:text-5xl">
        Continue talking
      </h1>
      <div className="relative overflow-hidden rounded-[32px] bg-[#efe6da] shadow-stage ring-1 ring-black/10">
        <div className="relative min-h-[560px] overflow-hidden md:min-h-[700px]">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={item.book.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#d8d4c3]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,238,224,0)_0%,rgba(27,29,22,0.08)_42%,rgba(12,14,12,0.86)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_38%)]" />

          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-5 py-5 md:px-7 md:py-7">
            <button
              type="button"
              onClick={handleHeroPlay}
              disabled={isUpdating}
              aria-label={`Play ${activeDotTitle}`}
              className="pointer-events-auto group flex h-28 w-28 items-center justify-center rounded-full bg-brand-primary text-black shadow-[0_14px_40px_rgba(0,0,0,0.25),0_0_0_8px_rgba(250,195,4,0.22)] transition duration-300 hover:scale-[1.03] disabled:cursor-not-allowed md:h-36 md:w-36 animate-[pulse_3s_ease-in-out_infinite]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="ml-1 h-12 w-12 md:h-16 md:w-16"
                fill="currentColor"
              >
                <path d="M4 2.5v11l9-5.5-9-5.5z" />
              </svg>
            </button>
          </div>

          <div className="relative z-20 flex h-full min-h-[560px] flex-col justify-between p-5 text-white md:min-h-[700px] md:p-7">
            {showOpenCircle ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onOpenCircle(item.book, Math.max(activeEpisodeNumber, 1))
                  }
                  className="rounded-full border border-white/40 bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-super text-white backdrop-blur-md transition hover:bg-white/22"
                >
                  Open circle
                </button>
              </div>
            ) : null}

            <div className="flex-1" />

            <div className="-mx-5 -mb-5 bg-[linear-gradient(180deg,rgba(17,20,17,0)_0%,rgba(12,12,11,0.72)_34%,rgba(8,8,7,0.9)_100%)] px-7 pb-5 pt-6 md:-mx-7 md:-mb-7 md:px-9 md:pb-7 md:pt-8">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h1
                    className="font-display max-w-[14ch] text-left text-3xl font-bold leading-[1.08] text-white md:text-5xl"
                    style={{ textShadow: "rgb(0, 0, 0) 0px 6px 14px" }}
                  >
                    {item.book.title}
                  </h1>
                  <div className="mt-5 flex items-center gap-3 text-xl font-medium text-white/90 md:text-3xl">
                    <span className="h-3 w-3 shrink-0 rounded-full bg-brand-primary" />
                    <span className="truncate">{`Dot ${activeEpisodeNumber} · ${activeDotTitle}`}</span>
                  </div>
                </div>
                {totalDots > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((current) => !current)}
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded ? "Hide dots" : `See all ${totalDots} dots`
                    }
                    className="mb-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/70 bg-black/20 text-white backdrop-blur-sm transition duration-300 hover:bg-black/35 active:scale-[0.97]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className={`h-6 w-6 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                    >
                      <path
                        d="M4.5 7.5L10 13l5.5-5.5"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-black/10 bg-[linear-gradient(180deg,#f7f1e8_0%,#efe7da_100%)] px-5 pb-6 pt-5 text-black md:px-7 md:pb-8 md:pt-6">
              {isLoadingEpisodes ? (
                <div className="rounded-3xl border border-black/10 bg-white/70 px-4 py-5 text-sm text-black/60">
                  Loading dots...
                </div>
              ) : null}

              {episodesError ? (
                <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                  {episodesError}
                </div>
              ) : null}

              {!isLoadingEpisodes && episodes.length === 0 ? (
                <div className="rounded-3xl border border-black/10 bg-white/70 px-4 py-5 text-sm text-black/60">
                  No dots available yet.
                </div>
              ) : null}

              {!isLoadingEpisodes && episodes.length > 0 ? (
                <div className="space-y-3">
                  {episodes.map((episode) => {
                    const isCompleted =
                      episode.status?.talking_status === "completed";
                    const isCurrent = episode.episode === activeEpisodeNumber;
                    const hasStarted =
                      (episode.status?.listening_status &&
                        episode.status.listening_status !== "not_started") ||
                      (episode.status?.talking_status &&
                        episode.status.talking_status !== "not_started");
                    const playLabel = isCompleted
                      ? "Listen again"
                      : hasStarted
                        ? "Resume"
                        : "Play";
                    const showRowButton = isCompleted || isCurrent;
                    const durationLabel =
                      episode.typeSlug !== "teachtime" &&
                      episode.typeSlug !== "debating" &&
                      Number.isFinite(episode.duration) &&
                      (episode.duration ?? 0) > 0
                        ? formatDuration(episode.duration as number)
                        : null;
                    const tags = getDotTags(
                      episode.typeSlug,
                      episode.typeName,
                      episode.vocabulary,
                    );

                    return (
                      <div
                        key={`${item.book.id}-episode-${episode.episode}`}
                        className={`flex items-center gap-4 rounded-3xl border px-4 py-4 transition md:px-5 md:py-5 ${
                          isCurrent
                            ? "border-black/15 bg-black text-white shadow-elevated"
                            : "border-black/10 bg-white/78 text-black"
                        }`}
                      >
                        <CircleDotsSymbol
                          totalDots={totalDots}
                          completedDots={completedDots}
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

                        <div className="min-w-0 flex-1">
                          {isCurrent ? (
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-primary">
                              Today's mission
                            </div>
                          ) : null}
                          <div className="font-display text-2xl font-bold leading-tight">
                            {episode.title || `Dot ${episode.episode}`}
                          </div>
                          <div
                            className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm ${
                              isCurrent ? "text-white/60" : "text-black/50"
                            }`}
                          >
                            {tags.map((tag) => (
                              <span
                                key={`${episode.episode}-${tag.label}`}
                                className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider"
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
                          </div>
                          {durationLabel || isCurrent ? (
                            <div
                              className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm ${
                                isCurrent ? "text-white/60" : "text-black/50"
                              }`}
                            >
                              {durationLabel ? (
                                <span
                                  className={`inline-flex items-center gap-1.5 ${
                                    isCurrent ? "text-white/85" : "text-black"
                                  }`}
                                >
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-[0.95em] w-[0.95em] shrink-0"
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
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        {showRowButton ? (
                          isCurrent ? (
                            <button
                              type="button"
                              onClick={() =>
                                handlePlayEpisode(
                                  episode.episode,
                                  episode.title,
                                  episode.typeSlug,
                                )
                              }
                              disabled={isUpdating}
                              aria-label={`Play ${episode.title || `Dot ${episode.episode}`}`}
                              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-black shadow-glow-gold transition hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed md:h-16 md:w-16"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 16 16"
                                className="ml-1 h-6 w-6 md:h-7 md:w-7"
                                fill="currentColor"
                              >
                                <path d="M4 2.5v11l9-5.5-9-5.5z" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handlePlayEpisode(
                                  episode.episode,
                                  episode.title,
                                  episode.typeSlug,
                                )
                              }
                              disabled={isUpdating}
                              className="shrink-0 rounded-full bg-black/10 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-black/18 active:scale-[0.97] disabled:cursor-not-allowed md:px-5 md:text-base"
                            >
                              Play again!
                            </button>
                          )
                        ) : null}
                      </div>
                    );
                  })}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenCircle(
                          item.book,
                          Math.max(activeEpisodeNumber, 1),
                        )
                      }
                      className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-black/70 shadow-[0_6px_18px_rgba(0,0,0,0.04)] backdrop-blur-sm transition hover:border-black/20 hover:bg-white hover:text-black"
                    >
                      Explore circle
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentCircleHero;
