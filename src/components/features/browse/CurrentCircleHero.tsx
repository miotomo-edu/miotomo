import React, { useEffect, useMemo, useState } from "react";
import type { Book } from "../../sections/LibrarySection";
import { useCircleCover } from "../../../hooks/useCircleCover";
import { supabase } from "../../../hooks/integrations/supabase/client";
import { useBooks } from "../../../hooks/useBooks";

type CurrentCircleHeroProps = {
  studentId: string;
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
  status?: EpisodeStatus;
};

const normalizeDotTypeSlug = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "mediaton") return "mediation";
  return normalized;
};

const formatDuration = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "--:--";
  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const CurrentCircleHero: React.FC<CurrentCircleHeroProps> = ({
  studentId,
  item,
  onOpenCircle,
  onPlay,
}) => {
  const coverUrl = useCircleCover(item.book.thumbnailUrl);
  const [isExpanded, setIsExpanded] = useState(false);
  const [episodes, setEpisodes] = useState<EpisodeMeta[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);
  const { updateBookProgress, isUpdating } = useBooks(studentId);

  const totalDots = Math.max(Number(item.totalDots) || 0, Number(item.book.chapters) || 0);
  const completedDots = Math.max(Number(item.completedDots) || 0, 0);
  const progressDot =
    typeof item.currentDot === "number" && item.currentDot > 0
      ? item.currentDot
      : null;

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
            .select("episode, title, duration, type, created_at")
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
          });
        });

        const typeIds = Array.from(
          new Set(
            Array.from(episodeEntries.values())
              .map((entry) => entry.typeId)
              .filter((value): value is number => Number.isFinite(value) && value > 0),
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
            const typeEntry = entry?.typeId ? typeMap.get(entry.typeId) : undefined;

            return {
              episode,
              title: entry?.title ?? null,
              typeName: typeEntry?.name,
              typeSlug: typeEntry?.slug,
              duration: entry?.duration ?? undefined,
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
      episodes.find((episode) => episode.episode === activeEpisodeNumber) ?? null
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
    <section className="px-4">
      <h1 className="font-display mb-7 text-3xl font-bold leading-none md:text-5xl">
        Continue talking
      </h1>
      <div className="relative overflow-hidden rounded-[34px] bg-[#efe6da] shadow-[0_28px_90px_rgba(25,26,20,0.18)] ring-1 ring-black/10">
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

          <div className="absolute inset-0 z-10 flex items-center justify-center px-5 py-5 md:px-7 md:py-7">
            <button
              type="button"
              onClick={handleHeroPlay}
              disabled={isUpdating}
              aria-label={`Play ${activeDotTitle}`}
              className="group flex h-28 w-28 items-center justify-center rounded-full bg-white/92 text-black shadow-[0_14px_40px_rgba(0,0,0,0.25)] backdrop-blur-md transition duration-300 hover:scale-[1.03] hover:bg-white disabled:cursor-not-allowed md:h-36 md:w-36"
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
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  onOpenCircle(item.book, Math.max(activeEpisodeNumber, 1))
                }
                className="rounded-full border border-white/40 bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-white/22"
              >
                Open circle
              </button>
            </div>

            <div className="flex-1" />

            <div className="-mx-5 -mb-5 bg-[linear-gradient(180deg,rgba(17,20,17,0)_0%,rgba(12,12,11,0.72)_34%,rgba(8,8,7,0.9)_100%)] px-7 pb-5 pt-6 md:-mx-7 md:-mb-7 md:px-9 md:pb-7 md:pt-8">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h1
                    className="font-display max-w-[14ch] text-left text-5xl font-bold leading-[1.02] text-white md:text-5xl"
                    style={{ textShadow: "rgb(0, 0, 0) 0px 6px 14px" }}
                  >
                    {item.book.title}
                  </h1>
                  <div className="mt-5 flex items-center gap-3 text-xl font-medium text-white/90 md:text-[2rem]">
                    <span className="h-3 w-3 rounded-full bg-white/90" />
                    <span className="truncate">{`E${activeEpisodeNumber}: ${activeDotTitle}`}</span>
                  </div>
                  {totalDots > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2 md:gap-2.5">
                      {Array.from({ length: totalDots }).map((_, index) => {
                        const isFilled = index < completedDots;
                        const isCurrent =
                          index + 1 === highlightedDot && !isFilled;
                        return (
                          <span
                            key={`${item.book.id}-hero-dot-${index}`}
                            className={`h-3 w-3 rounded-full transition md:h-4 md:w-4 ${
                              isCurrent
                                ? "border-[2.5px] border-white bg-transparent"
                                : isFilled
                                  ? "bg-white"
                                  : "border border-white/55 bg-white/20"
                            }`}
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setIsExpanded((current) => !current)}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded ? "Collapse dot list" : "Expand dot list"
                  }
                  className="mb-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-black/18 text-white backdrop-blur-sm transition duration-300 hover:scale-[1.04] hover:bg-black/30 md:h-20 md:w-20"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className={`h-9 w-9 transition-transform duration-300 ${
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
              <div className="mb-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() =>
                    onOpenCircle(item.book, Math.max(activeEpisodeNumber, 1))
                  }
                  aria-label={`Open information for ${item.book.title}`}
                  className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#cfc4b5] font-['Georgia',_serif] text-lg font-bold text-[#221f1b] transition hover:bg-[#c3b7a7] md:h-12 md:w-12 md:text-xl"
                >
                  i
                </button>
              </div>

              {isLoadingEpisodes ? (
                <div className="rounded-[24px] border border-black/10 bg-white/70 px-4 py-5 text-sm text-black/60">
                  Loading dots...
                </div>
              ) : null}

              {episodesError ? (
                <div className="mb-4 rounded-[24px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                  {episodesError}
                </div>
              ) : null}

              {!isLoadingEpisodes && episodes.length === 0 ? (
                <div className="rounded-[24px] border border-black/10 bg-white/70 px-4 py-5 text-sm text-black/60">
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
                      Number.isFinite(episode.duration) &&
                      (episode.duration ?? 0) > 0
                        ? formatDuration(episode.duration as number)
                        : null;

                    return (
                      <div
                        key={`${item.book.id}-episode-${episode.episode}`}
                        className={`flex items-start gap-4 rounded-[26px] border px-4 py-4 transition md:px-5 md:py-5 ${
                          isCurrent
                            ? "border-black/15 bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
                            : "border-black/10 bg-white/78 text-black"
                        }`}
                      >
                        <div
                          className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold md:h-12 md:w-12 md:text-base ${
                            isCurrent
                              ? "border-white/35 bg-white/12 text-white"
                              : isCompleted
                                ? "border-[#f25a57] bg-[#f25a57] text-white"
                                : "border-black/20 bg-[#f8f3eb] text-black"
                          }`}
                        >
                          {episode.episode}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-lg font-semibold leading-tight md:text-2xl">
                            {episode.title || `Dot ${episode.episode}`}
                          </div>
                          <div
                            className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-base md:text-lg ${
                              isCurrent ? "text-white/72" : "text-black/55"
                            }`}
                          >
                            {episode.typeName ? <span>{episode.typeName}</span> : null}
                            {episode.typeName && durationLabel ? (
                              <span aria-hidden="true">&bull;</span>
                            ) : null}
                            {durationLabel ? <span>{durationLabel}</span> : null}
                            {(episode.typeName || durationLabel) && isCompleted ? (
                              <span aria-hidden="true">&bull;</span>
                            ) : null}
                            {isCompleted ? <span>Completed</span> : null}
                            {(episode.typeName || durationLabel) &&
                            !isCompleted &&
                            isCurrent ? (
                              <span aria-hidden="true">&bull;</span>
                            ) : null}
                            {!isCompleted && isCurrent ? (
                              <span>Current mission</span>
                            ) : null}
                          </div>
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
                              className="shrink-0 flex h-16 w-16 items-center justify-center rounded-full bg-[#f25a57] text-white shadow-[0_0_0_8px_rgba(242,90,87,0.22)] transition hover:scale-[1.02] disabled:cursor-not-allowed md:h-20 md:w-20"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 16 16"
                                className="ml-1 h-7 w-7 md:h-9 md:w-9"
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
                              className="shrink-0 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed md:px-5 md:text-base"
                            >
                              {playLabel}
                            </button>
                          )
                        ) : null}
                      </div>
                    );
                  })}
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
