import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Book } from "./LibrarySection";
import { supabase } from "../../hooks/integrations/supabase/client";
import { useBrowseCircles } from "../../hooks/useBrowseCircles";
import { useCircleCover } from "../../hooks/useCircleCover";

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
  typeSlug?: string;
};

const normalizeDotTypeSlug = (value: string | null | undefined) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
};

const getFirstName = (userName: string) =>
  userName.trim().split(/\s+/)[0] || "Explorer";

const PostOnboardingCircleIntroPage: React.FC<
  PostOnboardingCircleIntroPageProps
> = ({ studentId, userName, bookId, onPlayEpisode }) => {
  const { data: browseData, isLoading: isLoadingBrowse } =
    useBrowseCircles(studentId);

  const resolvedBookId = useMemo(
    () =>
      bookId ?? browseData?.circles.find((circle) => circle.demo)?.id ?? null,
    [bookId, browseData?.circles],
  );

  const book = useMemo(
    () =>
      resolvedBookId
        ? (browseData?.circles.find((circle) => circle.id === resolvedBookId) ??
          null)
        : null,
    [resolvedBookId, browseData?.circles],
  );

  const coverUrl = useCircleCover(book?.thumbnailUrl);

  const {
    data: dots = [],
    isLoading: isLoadingDots,
    error: dotsError,
  } = useQuery({
    queryKey: ["post-onboarding-circle-dots", resolvedBookId],
    enabled: Boolean(resolvedBookId),
    queryFn: async (): Promise<CircleDotRecord[]> => {
      const { data, error } = await supabase
        .from("circles_dots")
        .select("episode, title, type, created_at")
        .eq("circle_id", resolvedBookId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const episodeEntries = new Map<
        number,
        { title: string | null; typeId: number | null }
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

      const typeMap = new Map<number, string | undefined>();
      if (typeIds.length > 0) {
        const { data: typeData, error: typeError } = await supabase
          .from("dots_type")
          .select("id, slug")
          .in("id", typeIds);

        if (typeError) throw typeError;

        (typeData ?? []).forEach((row) => {
          const idValue = Number(row.id);
          if (!Number.isFinite(idValue)) return;
          typeMap.set(idValue, normalizeDotTypeSlug(row.slug) ?? undefined);
        });
      }

      return Array.from(episodeEntries.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([episode, entry]) => ({
          episode,
          title: entry.title,
          typeId: entry.typeId,
          typeSlug: entry.typeId ? typeMap.get(entry.typeId) : undefined,
        }));
    },
  });

  const firstDot = dots.find((dot) => dot.episode === 1) ?? dots[0] ?? null;
  const heroTitle = firstDot?.title || book?.title || "Your first adventure";
  const firstName = getFirstName(userName);
  const isLoading = isLoadingBrowse || isLoadingDots;

  const handleStartAdventure = () => {
    if (!book || !firstDot) return;
    onPlayEpisode(
      book,
      firstDot.episode,
      firstDot.title || undefined,
      firstDot.typeSlug,
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0b] px-6 text-center text-base font-semibold text-white/78">
        Getting your first adventure ready...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0b] px-6 text-center text-base font-semibold text-white/78">
        Your first adventure is not available yet.
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d0d0b] text-white">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={book.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-[#1b211f]" />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,4,0.16)_0%,rgba(6,6,5,0.08)_28%,rgba(7,7,6,0.52)_62%,rgba(5,5,4,0.96)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[46vh] bg-[linear-gradient(180deg,rgba(8,8,7,0)_0%,rgba(8,8,7,0.92)_76%,rgba(8,8,7,1)_100%)]" />

      <section className="relative z-10 flex min-h-screen flex-col justify-end px-5 pb-8 pt-10 md:px-8 md:pb-10">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-super text-white/78 md:text-base">
            {firstName}, your first story is ready
          </p>
          <h1 className="font-display mt-4 max-w-[10ch] text-[4rem] font-bold leading-[0.88] text-white md:text-[6.5rem]">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-lg font-medium leading-7 text-white/88 md:text-2xl md:leading-9">
            Step in and begin the first chapter of your adventure:
            <br />
            1. Listen closely and follow the story
            <br />
            2. Verbally share what you think
          </p>

          {dotsError ? (
            <p className="mt-5 max-w-md rounded-2xl border border-white/20 bg-black/35 px-4 py-3 text-sm font-semibold text-white/82 backdrop-blur-sm">
              We could not load the first episode yet.
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleStartAdventure}
            disabled={!firstDot || Boolean(dotsError)}
            className="mt-8 inline-flex min-h-[4rem] w-full cursor-pointer items-center justify-center rounded-full bg-brand-primary px-8 py-4 text-xl font-black text-[#171411] shadow-[0_18px_48px_rgba(0,0,0,0.28),0_0_0_8px_rgba(250,195,4,0.18)] transition duration-300 hover:brightness-[1.03] focus:outline-none focus:ring-4 focus:ring-white/70 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:min-w-[18rem]"
          >
            Start your adventure
          </button>
        </div>
      </section>
    </main>
  );
};

export default PostOnboardingCircleIntroPage;
