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

const normalizeDotTypeSlug = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
};

const CurrentCircleHero: React.FC<CurrentCircleHeroProps> = ({
  studentId,
  item,
  onOpenCircle,
  showOpenCircle = false,
  onPlay,
}) => {
  const coverUrl = useCircleCover(item.book.thumbnailUrl);
  const [episodes, setEpisodes] = useState<EpisodeMeta[]>([]);
  const { updateBookProgress, isUpdating } = useBooks(studentId);

  useEffect(() => {
    let isCancelled = false;

    const loadEpisodes = async () => {
      if (!item.book.id) return;

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
        setEpisodes([]);
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
      <div className="relative w-full overflow-hidden bg-[#0d0d0b]">
        <div className="relative min-h-screen overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={item.book.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-[#d8d4c3]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,7,0.18)_0%,rgba(8,8,7,0.06)_24%,rgba(8,8,7,0.22)_48%,rgba(8,8,7,0.82)_78%,rgba(6,6,5,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,245,210,0.22)_0%,rgba(255,255,255,0)_34%)]" />
          <div className="absolute inset-y-0 left-0 w-[16vw] min-w-[24px] bg-[linear-gradient(90deg,rgba(7,7,6,0.24)_0%,rgba(7,7,6,0)_100%)]" />
          <div className="absolute inset-y-0 right-0 w-[16vw] min-w-[24px] bg-[linear-gradient(270deg,rgba(7,7,6,0.24)_0%,rgba(7,7,6,0)_100%)]" />

          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-5 py-5 md:px-8 md:py-8">
            <div className="pointer-events-none relative flex h-28 w-28 items-center justify-center md:h-36 md:w-36">
              <span
                aria-hidden="true"
                className="hero-play-pulse absolute inset-0 rounded-full border border-[rgba(250,195,4,0.55)] bg-[radial-gradient(circle,rgba(250,195,4,0.22)_0%,rgba(250,195,4,0.08)_48%,rgba(250,195,4,0)_72%)]"
              />
              <button
                type="button"
                onClick={handleHeroPlay}
                disabled={isUpdating}
                aria-label={`Play ${activeDotTitle}`}
                className="pointer-events-auto relative z-10 group flex h-28 w-28 items-center justify-center rounded-full bg-brand-primary text-black shadow-[0_14px_40px_rgba(0,0,0,0.25),0_0_0_8px_rgba(250,195,4,0.22)] transition duration-300 hover:scale-[1.03] disabled:cursor-not-allowed md:h-36 md:w-36"
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
          </div>

          <div className="relative z-20 flex min-h-screen flex-col justify-between pb-8 pt-6 text-white md:pb-10 md:pt-8">
            {showOpenCircle ? (
              <div className="flex justify-end px-5 md:px-8">
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

            <div className="w-full border-t border-white/12 bg-[linear-gradient(180deg,rgba(15,15,13,0)_0%,rgba(9,9,8,0.32)_12%,rgba(8,8,7,0.84)_100%)] pb-0 pt-7 md:pt-8">
              <div className="px-5 md:px-8">
                <button
                  type="button"
                  onClick={() =>
                    onOpenCircle(item.book, Math.max(activeEpisodeNumber, 1))
                  }
                  className="min-w-0 max-w-[19rem] text-left md:max-w-[28rem]"
                  aria-label={`Open ${item.book.title}`}
                >
                  <h1
                    className="font-display max-w-[11ch] text-left text-[2.8rem] font-bold leading-[0.94] text-white md:text-[5.25rem]"
                    style={{ textShadow: "rgba(0, 0, 0, 0.42) 0px 10px 28px" }}
                  >
                    {item.book.title}
                  </h1>
                  <div className="mt-5 flex items-center gap-3 text-lg font-medium text-white/90 md:text-[1.75rem]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-primary shadow-[0_0_14px_rgba(250,195,4,0.7)]" />
                    <span className="truncate">{`Dot ${activeEpisodeNumber}: ${activeDotTitle}`}</span>
                  </div>
                </button>
                <div className="pointer-events-none mt-5 flex justify-center text-white/82">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-7 w-7 animate-bounce"
                    fill="none"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentCircleHero;
