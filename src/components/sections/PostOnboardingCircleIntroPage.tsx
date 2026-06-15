import React, { useMemo, useState } from "react";
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
  // null = split screen; string id = detail view for that circle
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(
    bookId ?? null,
  );

  const { data: browseData, isLoading: isLoadingBrowse } =
    useBrowseCircles(studentId);

  const demoCircle = useMemo(
    () =>
      browseData?.circles.find((c) => c.demoOrder === 1) ??
      browseData?.circles.find((c) => c.demo) ??
      null,
    [browseData?.circles],
  );

  const secondCircle = useMemo(
    () => browseData?.circles.find((c) => c.demoOrder === 2) ?? null,
    [browseData?.circles],
  );

  const detailBook = useMemo(
    () =>
      selectedCircleId
        ? (browseData?.circles.find((c) => c.id === selectedCircleId) ?? null)
        : null,
    [selectedCircleId, browseData?.circles],
  );

  // Hooks must be called unconditionally — unused values are inert
  const demoCoverUrl = useCircleCover(demoCircle?.thumbnailUrl);
  const secondCoverUrl = useCircleCover(secondCircle?.thumbnailUrl);
  const detailCoverUrl = useCircleCover(detailBook?.thumbnailUrl);

  const {
    data: dots = [],
    isLoading: isLoadingDots,
    error: dotsError,
  } = useQuery({
    queryKey: ["post-onboarding-circle-dots", selectedCircleId],
    enabled: Boolean(selectedCircleId),
    queryFn: async (): Promise<CircleDotRecord[]> => {
      const { data, error } = await supabase
        .from("circles_dots")
        .select("episode, title, type, created_at")
        .eq("circle_id", selectedCircleId)
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

  const firstName = getFirstName(userName);

  // ── Screen 1: Split selection screen ──────────────────────────────────────
  if (!selectedCircleId) {
    if (isLoadingBrowse) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0d0d0b] px-6 text-center text-base font-semibold text-white/78">
          Getting your adventures ready...
        </div>
      );
    }

    return (
      <main className="min-h-screen bg-[#4F415F] px-5 pb-10 pt-14 md:px-8 md:pt-16">
        <h1 className="mb-8 text-3xl font-black text-white md:text-4xl">
          {firstName}, choose your adventure
        </h1>

        <div className="grid grid-cols-2 gap-4">
          {/* Card 1 — demo circle */}
          <div className="flex flex-col rounded-2xl bg-[#32294A] p-3">
            <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-white/10">
              {demoCoverUrl ? (
                <img
                  src={demoCoverUrl}
                  alt={demoCircle?.title}
                  className="h-full w-full object-cover object-center"
                />
              ) : null}
            </div>
            <p className="mt-2.5 mb-3 text-sm font-bold leading-snug text-white md:text-base">
              {demoCircle?.title ?? "Your first adventure"}
            </p>
            <button
              type="button"
              disabled={!demoCircle}
              onClick={() => demoCircle && setSelectedCircleId(demoCircle.id)}
              className="mt-auto w-full rounded-xl py-2.5 text-sm font-black text-[#1a1a1a] transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Let's go!
            </button>
          </div>

          {/* Card 2 — second circle or placeholder */}
          {secondCircle ? (
            <div className="flex flex-col rounded-2xl bg-[#32294A] p-3">
              <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-white/10">
                {secondCoverUrl ? (
                  <img
                    src={secondCoverUrl}
                    alt={secondCircle.title}
                    className="h-full w-full object-cover object-center"
                  />
                ) : null}
              </div>
              <p className="mt-2.5 mb-3 text-sm font-bold leading-snug text-white md:text-base">
                {secondCircle.title}
              </p>
              <button
                type="button"
                onClick={() => setSelectedCircleId(secondCircle.id)}
                className="mt-auto w-full rounded-xl py-2.5 text-sm font-black text-[#1a1a1a] transition duration-200 active:scale-[0.97]"
              >
                Let's go!
              </button>
            </div>
          ) : (
            <div className="flex flex-col rounded-2xl bg-[#32294A] p-3">
              <div className="aspect-[2/3] w-full rounded-xl bg-white/10" />
              <p className="mt-2.5 text-sm font-bold leading-snug text-white/35 md:text-base">
                Coming soon
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── Screen 2: Detail view for the selected circle ─────────────────────────
  if (isLoadingBrowse || isLoadingDots) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0b] px-6 text-center text-base font-semibold text-white/78">
        Getting your adventure ready...
      </div>
    );
  }

  if (!detailBook) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0b] px-6 text-center text-base font-semibold text-white/78">
        Your adventure is not available yet.
      </div>
    );
  }

  const firstDot = dots.find((dot) => dot.episode === 1) ?? dots[0] ?? null;
  const heroTitle = firstDot?.title || detailBook.title || "Your first adventure";

  const handleStartAdventure = () => {
    if (!detailBook || !firstDot) return;
    onPlayEpisode(
      detailBook,
      firstDot.episode,
      firstDot.title || undefined,
      firstDot.typeSlug,
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d0d0b] text-white">
      {detailCoverUrl ? (
        <img
          src={detailCoverUrl}
          alt={detailBook.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-[#1b211f]" />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,4,0.16)_0%,rgba(6,6,5,0.08)_28%,rgba(7,7,6,0.52)_62%,rgba(5,5,4,0.96)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[46vh] bg-[linear-gradient(180deg,rgba(8,8,7,0)_0%,rgba(8,8,7,0.92)_76%,rgba(8,8,7,1)_100%)]" />

      {/* Back button — only when the split screen is reachable */}
      {!bookId && (
        <button
          type="button"
          onClick={() => setSelectedCircleId(null)}
          className="absolute left-5 top-5 z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black backdrop-blur-sm transition hover:bg-white active:scale-[0.97] md:left-8 md:top-8"
        >
          ← Back
        </button>
      )}

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
