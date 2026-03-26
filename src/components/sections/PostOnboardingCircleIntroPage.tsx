import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Book } from "./LibrarySection";
import { supabase } from "../../hooks/integrations/supabase/client";
import { useBrowseCircles } from "../../hooks/useBrowseCircles";
import CircleDotsSymbol from "../features/browse/CircleDotsSymbol";
import { VocabularyIcon } from "../common/icons/VocabularyIcon";
import { StarIcon } from "../common/icons/StarIcon";
import tomoIcon from "../../assets/img/tomo.svg";

type PostOnboardingCircleIntroPageProps = {
  studentId: string;
  userName: string;
  bookId?: string;
  onPlayEpisode: (
    book: Book,
    episode: number,
    dotTitle?: string,
    dotTypeSlug?: string,
  ) => void;
};

type CircleDotRecord = {
  episode: number;
  title: string | null;
  typeId: number | null;
  typeName?: string;
  typeSlug?: string;
  vocabulary?: boolean;
};

type DotTag = {
  icon: "listen" | "talk" | "vocabulary" | "teach" | "debate" | "spelling" | "generic";
  label: string;
};

const normalizeDotTypeSlug = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
};

const getReaderPossessive = (userName: string) => {
  const firstName = userName.trim().split(/\s+/)[0] || "Your";
  return firstName.endsWith("s") ? `${firstName}'` : `${firstName}'s`;
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
      return [{ icon: "teach", label: (typeName || "Teach time with Tomo").toUpperCase() }];
    case "debating":
      return [{ icon: "debate", label: (typeName || "Take a side").toUpperCase() }];
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

const PostOnboardingCircleIntroPage: React.FC<
  PostOnboardingCircleIntroPageProps
> = ({ studentId, userName, bookId, onPlayEpisode }) => {
  const { data: browseData, isLoading: isLoadingBrowse } =
    useBrowseCircles(studentId);

  const resolvedBookId = useMemo(
    () => bookId ?? browseData?.circles.find((circle) => circle.demo)?.id ?? null,
    [bookId, browseData?.circles],
  );

  const book = useMemo(
    () =>
      resolvedBookId
        ? browseData?.circles.find((circle) => circle.id === resolvedBookId) ?? null
        : null,
    [resolvedBookId, browseData?.circles],
  );

  const progressByEpisode = useMemo(() => {
    const completedEpisodes = new Set<number>();
    (browseData?.progressRows ?? []).forEach((row) => {
      if (row.book_id !== resolvedBookId) return;
      if (row.talking_status !== "completed") return;
      const episode = Number(row.episode ?? 0);
      if (!Number.isFinite(episode) || episode <= 0) return;
      completedEpisodes.add(episode);
    });
    return completedEpisodes;
  }, [resolvedBookId, browseData?.progressRows]);

  const { data: dots = [], isLoading: isLoadingDots, error: dotsError } =
    useQuery({
      queryKey: ["post-onboarding-circle-dots", resolvedBookId],
      enabled: Boolean(resolvedBookId),
      queryFn: async (): Promise<CircleDotRecord[]> => {
        const { data, error } = await supabase
          .from("circles_dots")
          .select("episode, title, type, vocabulary, created_at")
          .eq("circle_id", resolvedBookId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const episodeEntries = new Map<
          number,
          {
            title: string | null;
            typeId: number | null;
            vocabulary: boolean;
          }
        >();

        (data ?? []).forEach((row) => {
          const episode = Number(row.episode);
          if (!Number.isFinite(episode) || episode <= 0) return;
          if (episodeEntries.has(episode)) return;
          episodeEntries.set(episode, {
            title:
              typeof row.title === "string" && row.title.trim().length > 0
                ? row.title.trim()
                : null,
            typeId: Number.isFinite(Number(row.type)) ? Number(row.type) : null,
            vocabulary: Boolean(row.vocabulary),
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

          if (typeError) throw typeError;

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

        return Array.from(episodeEntries.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([episode, entry]) => ({
            episode,
            title: entry.title,
            typeId: entry.typeId,
            typeName: entry.typeId ? typeMap.get(entry.typeId)?.name : undefined,
            typeSlug: entry.typeId ? typeMap.get(entry.typeId)?.slug : undefined,
            vocabulary: entry.vocabulary,
          }));
      },
    });

  const totalDots = Math.max(Number(book?.chapters) || 0, dots.length);
  const completedDots = progressByEpisode.size;
  const readerPossessive = getReaderPossessive(userName);
  const firstDot = dots.find((dot) => dot.episode === 1) ?? dots[0] ?? null;

  const handlePlayDot = (dot: CircleDotRecord | null) => {
    if (!book || !dot) return;
    onPlayEpisode(book, dot.episode, dot.title || undefined, dot.typeSlug);
  };

  if (isLoadingBrowse || isLoadingDots) {
    return (
      <div className="min-h-screen bg-white px-6 py-8 text-black/60">
        Loading your first circle...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-white px-6 py-8 text-black/60">
        Demo circle not available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 pb-28 pt-6 text-black">
      <div className="flex w-full flex-col gap-6">
        <section className="overflow-hidden rounded-[26px] bg-[linear-gradient(180deg,#020617_0%,#0b1020_100%)] px-5 py-6 text-white">
          <div className="flex items-start gap-4">
            <CircleDotsSymbol
              totalDots={Math.max(totalDots, 1)}
              completedDots={completedDots}
              currentDot={null}
              size={52}
              ringColor="#ffffff"
              inactiveDotFill="#ffffff"
              inactiveDotStroke="#ffffff"
              completedDotFill="#FAC304"
              completedDotStroke="#FAC304"
              labelColor="#ffffff"
              className="shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-display text-[2rem] font-bold leading-[1.02] tracking-[-0.03em] text-white">
                <span className="text-[#FAC304]">{readerPossessive}</span>{" "}
                first circle starts here
              </h1>
              <p className="mt-4 text-lg leading-8 text-white/88">
                A <span className="font-semibold text-[#FAC304]">Circle</span> is
                a big topic. Each Circle has smaller episodes called{" "}
                <span className="font-semibold text-[#FAC304]">Dots</span>.
                Complete every Dot and then teach Tomo about the topic.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4">
            <CircleDotsSymbol
              totalDots={Math.max(totalDots, 1)}
              completedDots={completedDots}
              currentDot={null}
              size={54}
              ringColor="#0a1024"
              inactiveDotFill="#0a1024"
              inactiveDotStroke="#0a1024"
              completedDotFill="#FAC304"
              completedDotStroke="#FAC304"
              labelColor="#0a1024"
              className="shrink-0"
            />
            <h2
              className="font-display flex-1 text-[2rem] font-bold leading-none tracking-[-0.06em] text-black md:text-[2.5rem]"
            >
              {book.title}
            </h2>
          </div>
        </section>

        {dotsError ? (
          <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            Could not load the dots for this circle.
          </div>
        ) : null}

        <section className="space-y-4">
          {dots.map((dot) => {
            const isTeachCard = dot.typeSlug === "teachtime";
            const isCompleted = progressByEpisode.has(dot.episode);
            const previewCompletedDots = Math.min(
              Math.max(dot.episode, 1),
              Math.max(totalDots, 1),
            );
            const tags = getDotTags(dot.typeSlug, dot.typeName, dot.vocabulary);

            if (isTeachCard) {
              return (
                <div
                  key={`${book.id}-dot-${dot.episode}`}
                  className="w-full rounded-[22px] border border-black bg-[#F2F2F2] px-4 py-4 text-left"
                >
                  <div className="flex items-start gap-4">
                    <CircleDotsSymbol
                      totalDots={Math.max(totalDots, 1)}
                      completedDots={previewCompletedDots}
                      currentDot={dot.episode}
                      label={dot.episode}
                      size={48}
                      ringColor="#0a1024"
                      inactiveDotFill="#0a1024"
                      inactiveDotStroke="#0a1024"
                      completedDotFill="#FAC304"
                      completedDotStroke="#FAC304"
                      labelColor="#0a1024"
                      className="mt-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium uppercase tracking-[0.06em] text-slate-500 md:text-[0.95rem]">
                        {tags.map((tag) => (
                          <span
                            key={`${dot.episode}-${tag.label}`}
                            className="inline-flex items-center gap-1.5"
                          >
                            <LineTagIcon icon={tag.icon} className="h-[1.05em] w-[1.05em] shrink-0 text-black" />
                            <span>{tag.label}</span>
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 font-display text-[1.35rem] font-bold leading-[1.02] text-[#111827] md:text-[1.6rem]">
                        {dot.title || `Dot ${dot.episode}`}
                      </div>
                      <p className="mt-2 text-[1.15rem] leading-7 text-black/78">
                        Tomo knows nothing.{" "}
                        <span className="font-semibold text-[#F1A210]">
                          {userName.trim().split(/\s+/)[0] || "You"}
                        </span>{" "}
                        has accepted the challenge of educating him.
                      </p>
                      <div className="mt-4 flex items-start gap-2 text-[1.12rem] font-semibold text-[#1d1b20]">
                        <img
                          src={tomoIcon}
                          alt=""
                          className="h-7 w-7 shrink-0"
                          aria-hidden="true"
                        />
                        <p className="min-w-0 leading-7">
                          <span className="text-[#F1A210]">
                            {userName.trim().split(/\s+/)[0] || "You"}
                          </span>
                          <span>, I am counting on you!</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${book.id}-dot-${dot.episode}`}
                className="w-full rounded-[22px] bg-[#F2F2F2] px-4 py-4 text-left"
              >
                <div className="flex items-start gap-4">
                  <CircleDotsSymbol
                    totalDots={Math.max(totalDots, 1)}
                    completedDots={previewCompletedDots}
                    currentDot={dot.episode}
                    label={dot.episode}
                    size={48}
                    ringColor="#0a1024"
                    inactiveDotFill="#0a1024"
                    inactiveDotStroke="#0a1024"
                    completedDotFill="#FAC304"
                    completedDotStroke="#FAC304"
                    labelColor="#0a1024"
                    className="mt-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium uppercase tracking-[0.06em] text-slate-500 md:text-[0.95rem]">
                      {tags.map((tag) => (
                        <span
                          key={`${dot.episode}-${tag.label}`}
                          className="inline-flex items-center gap-1.5"
                        >
                          <LineTagIcon icon={tag.icon} className="h-[1.05em] w-[1.05em] shrink-0 text-black" />
                          <span>{tag.label}</span>
                        </span>
                      ))}
                      {isCompleted ? (
                        <span className="font-semibold text-[#b07b00]">
                          Completed
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 font-display text-[1.35rem] font-bold leading-[1.02] text-[#111827] md:text-[1.6rem]">
                      {dot.title || `Dot ${dot.episode}`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <button
          type="button"
          onClick={() => handlePlayDot(firstDot)}
          disabled={!firstDot}
          className="mt-2 inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#020617] px-6 py-3 text-lg font-bold text-white transition hover:bg-[#0b1020] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Start Dot 1
        </button>
      </div>
    </div>
  );
};

export default PostOnboardingCircleIntroPage;
