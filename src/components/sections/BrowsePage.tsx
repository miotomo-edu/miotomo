import React, { useMemo } from "react";
import WelcomeSection from "./WelcomeSection";
import { useBrowseCircles } from "../../hooks/useBrowseCircles";
import BrowseRow, { type BrowseRowItem } from "../features/browse/BrowseRow";
import CategoryChips from "../features/browse/CategoryChips";
import CurrentCircleHero from "../features/browse/CurrentCircleHero";
import type { Book } from "./LibrarySection";

type BrowsePageProps = {
  userName: string;
  studentId: string;
  collapseHeroSignal?: number;
  onOpenCircle: (book: Book, chapter: number) => void;
  onPlayEpisode: (
    book: Book,
    episode: number,
    dotTitle?: string,
    dotTypeSlug?: string,
  ) => void;
  showContinueRow?: boolean;
};

const THEME_BUCKETS = [
  { key: "nature", label: "Nature Wonders" },
  { key: "imagination", label: "Imagination Sparks" },
  { key: "history", label: "History Adventures" },
  { key: "big-questions", label: "Big Questions" },
  { key: "feelings", label: "Feelings & Empathy" },
  { key: "how-things-work", label: "How Things Work" },
];

const MOOD_BUCKETS = [
  { key: "playful", label: "Playful" },
  { key: "curious", label: "Curious" },
  { key: "imaginative", label: "Imaginative" },
  { key: "contemplative", label: "Contemplative" },
  { key: "serious", label: "Serious" },
];

const DOMAIN_BUCKETS = [
  { key: "science", label: "Science" },
  { key: "animals", label: "Animals" },
  { key: "space", label: "Space" },
  { key: "technology", label: "Technology" },
  { key: "people", label: "People & Places" },
  { key: "nature", label: "Nature" },
  { key: "emotions", label: "Emotions" },
  { key: "philosophy", label: "Philosophy" },
  { key: "time", label: "Time" },
];

const LENGTH_BUCKETS = [
  { key: "quick", label: "Quick Dots" },
  { key: "medium", label: "Medium Dots" },
  { key: "long", label: "Long Dots" },
];

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

const formatMetaStatus = (
  listening?: string | null,
  talking?: string | null,
) => {
  if (talking && talking !== "not_started") {
    return `Talking ${talking.replace("_", " ")}`;
  }
  if (listening && listening !== "not_started") {
    return `Listening ${listening.replace("_", " ")}`;
  }
  return "Not started";
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

const scoreSort = (a: Book, b: Book, scores: Record<string, number>) =>
  (scores[b.id] ?? 0) - (scores[a.id] ?? 0);

// -------- Skeleton --------
const S: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-black/[0.07] ${className}`} />
);

const BrowseRowSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="h-5 w-1.5 rounded-full bg-black/[0.07]" />
      <S className="h-5 w-32" />
    </div>
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 space-y-2 w-40">
          <S className="h-48 w-40 rounded-3xl" />
          <S className="h-3.5 w-28" />
          <S className="h-3 w-20" />
        </div>
      ))}
    </div>
  </div>
);

const BrowsePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white px-4 pb-24 pt-0">
    {/* WelcomeSection */}
    <div className="flex items-center gap-4 pb-4 pt-6">
      <S className="h-16 w-16 rounded-full" />
      <S className="h-8 w-40" />
    </div>
    {/* CategoryChips */}
    <div className="flex gap-2 pb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <S key={i} className="h-9 w-20 rounded-full" />
      ))}
    </div>
    {/* Hero card */}
    <div className="my-4 space-y-4">
      <S className="h-64 w-full rounded-[32px]" />
    </div>
    {/* Browse rows */}
    <div className="space-y-10">
      <BrowseRowSkeleton />
      <BrowseRowSkeleton />
    </div>
  </div>
);

const BrowsePage: React.FC<BrowsePageProps> = ({
  userName,
  studentId,
  collapseHeroSignal = 0,
  onOpenCircle,
  onPlayEpisode,
  showContinueRow = true,
}) => {
  const { data, isLoading, error } = useBrowseCircles(studentId);

  const enrichedCircles = useMemo(() => {
    const circles = data?.circles ?? [];
    return circles.map((circle) => {
      const catalog = circle.catalog ?? {};
      return {
        circle,
        catalog,
        themeTags: toTagList(catalog.theme_tags),
        moodTags: toTagList(catalog.mood_tags),
        domainTags: toTagList(catalog.domain_tags),
        lengthCategory: catalog.length_category ?? null,
        isNew: Boolean(catalog.is_new),
        featured:
          Boolean(catalog.featured) &&
          isWithinWindow(catalog.featured_start, catalog.featured_end),
        featuredRank: catalog.featured_rank ?? Number.POSITIVE_INFINITY,
        publishedAt: catalog.published_at ?? null,
        popularityScore: catalog.popularity_score ?? 0,
        qualityScore: catalog.quality_score ?? 0,
      };
    });
  }, [data?.circles]);

  const scoreById = useMemo(() => {
    const scores: Record<string, number> = {};
    enrichedCircles.forEach((entry) => {
      scores[entry.circle.id] =
        (entry.popularityScore ?? 0) * 2 + (entry.qualityScore ?? 0);
    });
    return scores;
  }, [enrichedCircles]);

  const featuredItems = useMemo(() => {
    const filtered = enrichedCircles.filter((entry) => entry.featured);
    return filtered.sort((a, b) => {
      if (a.featuredRank !== b.featuredRank) {
        return a.featuredRank - b.featuredRank;
      }
      if (a.publishedAt && b.publishedAt) {
        return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      }
      return 0;
    });
  }, [enrichedCircles]);

  const completedEpisodeCountByBook = useMemo(() => {
    const counts = new Map<string, Set<number>>();
    (data?.progressRows ?? []).forEach((row) => {
      if (!row.book_id || row.talking_status !== "completed") return;
      const episode = Number(row.episode ?? 0);
      if (!Number.isFinite(episode) || episode <= 0) return;
      const existing = counts.get(row.book_id) ?? new Set<number>();
      existing.add(episode);
      counts.set(row.book_id, existing);
    });
    return new Map(
      Array.from(counts.entries()).map(([bookId, episodes]) => [
        bookId,
        episodes.size,
      ]),
    );
  }, [data?.progressRows]);

  const completedBookIds = useMemo(() => {
    const ids = new Set<string>();
    enrichedCircles.forEach((entry) => {
      const totalDots = Number(entry.circle.chapters ?? 0);
      const completedDots = completedEpisodeCountByBook.get(entry.circle.id) ?? 0;
      if (totalDots > 0 && completedDots >= totalDots) {
        ids.add(entry.circle.id);
      }
    });
    return ids;
  }, [enrichedCircles, completedEpisodeCountByBook]);

  const completedEpisodeByBook = useMemo(() => {
    const map = new Map<string, number>();
    (data?.progressRows ?? []).forEach((row) => {
      if (!row.book_id || row.talking_status !== "completed") return;
      const episode = Number(row.episode ?? 0);
      if (!Number.isFinite(episode) || episode <= 0) return;
      const prev = map.get(row.book_id) ?? 0;
      if (episode > prev) {
        map.set(row.book_id, episode);
      }
    });
    return map;
  }, [data?.progressRows]);

  const dotTitleByBookEpisode = useMemo(() => {
    const map = new Map<string, string>();
    (data?.dotRows ?? []).forEach((row) => {
      const bookId = row.circle_id;
      const episode = Number(row.episode ?? 0);
      const title = typeof row.title === "string" ? row.title.trim() : "";
      if (!bookId || !Number.isFinite(episode) || episode <= 0 || !title) return;
      const key = `${bookId}:${episode}`;
      if (!map.has(key)) {
        map.set(key, title);
      }
    });
    return map;
  }, [data?.dotRows]);

  const newBookIds = useMemo(() => {
    const ids = new Set<string>();
    enrichedCircles.forEach((entry) => {
      if (!entry.isNew) return;
      if (completedBookIds.has(entry.circle.id)) return;
      ids.add(entry.circle.id);
    });
    return ids;
  }, [enrichedCircles, completedBookIds]);

  const getBadgeForBook = React.useCallback(
    (bookId: string) => {
      if (completedBookIds.has(bookId)) return "REPLAY";
      if (newBookIds.has(bookId)) return "NEW";
      return undefined;
    },
    [completedBookIds, newBookIds],
  );

  const continueItems = useMemo(() => {
    const progressRows = data?.progressRows ?? [];
    const activeRows = progressRows.filter((row) => {
      const listening = row.listening_status ?? "not_started";
      const talking = row.talking_status ?? "not_started";
      if (talking === "completed") return false;
      return (
        ["paused", "in_progress"].includes(listening) ||
        ["paused", "in_progress"].includes(talking)
      );
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
        const match = enrichedCircles.find(
          (entry) => entry.circle.id === bookId,
        );
        if (!match) return null;
        const episode = Number(row.episode ?? 1);
        const completedDots = completedEpisodeByBook.get(bookId) ?? 0;
        const isPaused =
          row.listening_status === "paused" || row.talking_status === "paused";
        const item: BrowseRowItem = {
          book: match.circle,
          chapter: episode,
          badge: "Continue",
          totalDots: match.circle.chapters ?? 0,
          completedDots,
          highlightCompleted: true,
          pausedDotIndex: isPaused ? episode : undefined,
        };
        return item;
      })
      .filter(Boolean) as BrowseRowItem[];
  }, [data?.progressRows, enrichedCircles, completedEpisodeByBook]);

  const continueBookIds = useMemo(() => {
    return new Set(continueItems.map((item) => item.book.id));
  }, [continueItems]);

  const currentCircleItem = useMemo(() => {
    const book = featuredItems[0]?.circle ?? enrichedCircles[0]?.circle ?? null;
    if (!book) return null;

    const continueItem = continueItems.find((item) => item.book.id === book.id);
    const totalDots = Math.max(Number(book.chapters) || 0, 0);
    const completedDots = completedEpisodeByBook.get(book.id) ?? 0;
    const nextChapter = continueItem?.chapter
      ? continueItem.chapter
      : totalDots > 0 && completedDots >= totalDots
        ? 1
        : Math.max(completedDots + 1, 1);

    return {
      book,
      badge: undefined,
      kicker: "CONTINUE TALKING",
      totalDots,
      completedDots,
      currentDot: continueItem?.chapter,
      nextChapter,
      nextDotTitle: dotTitleByBookEpisode.get(`${book.id}:${nextChapter}`),
    };
  }, [
    featuredItems,
    enrichedCircles,
    continueItems,
    completedEpisodeByBook,
    dotTitleByBookEpisode,
  ]);

  const listenAgainItems = useMemo(() => {
    const progressRows = data?.progressRows ?? [];
    const completedRows = progressRows.filter(
      (row) =>
        row.talking_status === "completed" &&
        !!row.book_id &&
        completedBookIds.has(row.book_id),
    );

    const byBook = new Map<string, (typeof completedRows)[0]>();
    completedRows.forEach((row) => {
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
        const match = enrichedCircles.find(
          (entry) => entry.circle.id === bookId,
        );
        if (!match) return null;
        const episode = Number(row.episode ?? 1);
        const item: BrowseRowItem = {
          book: match.circle,
          chapter: episode,
          badge: "REPLAY",
          totalDots: match.circle.chapters ?? 0,
          completedDots:
            completedEpisodeCountByBook.get(bookId) ?? match.circle.chapters ?? 0,
          highlightCompleted: true,
        };
        return item;
      })
      .filter(Boolean) as BrowseRowItem[];
  }, [data?.progressRows, enrichedCircles, completedBookIds, completedEpisodeCountByBook]);

  const newItems = useMemo(() => {
    return enrichedCircles
      .filter((entry) => newBookIds.has(entry.circle.id))
      .map((entry) => ({
        book: entry.circle,
        chapter: 1,
        badge: getBadgeForBook(entry.circle.id) ?? "NEW",
        totalDots: entry.circle.chapters ?? 0,
      }))
      .sort((a, b) => scoreSort(a.book, b.book, scoreById));
  }, [enrichedCircles, newBookIds, scoreById, getBadgeForBook]);

  const themeRows = useMemo(
    () =>
      THEME_BUCKETS.map((bucket) => ({
        title: bucket.label,
        items: enrichedCircles
          .filter((entry) => entry.themeTags.includes(bucket.key))
          .map((entry) => ({
            book: entry.circle,
            chapter: 1,
            badge: getBadgeForBook(entry.circle.id),
            totalDots: entry.circle.chapters ?? 0,
          }))
          .sort((a, b) => scoreSort(a.book, b.book, scoreById)),
      })),
    [enrichedCircles, scoreById, getBadgeForBook],
  );

  const moodRows = useMemo(
    () =>
      MOOD_BUCKETS.map((bucket) => ({
        title: bucket.label,
        items: enrichedCircles
          .filter((entry) => entry.moodTags.includes(bucket.key))
          .map((entry) => ({
            book: entry.circle,
            chapter: 1,
            badge: getBadgeForBook(entry.circle.id),
            totalDots: entry.circle.chapters ?? 0,
          }))
          .sort((a, b) => scoreSort(a.book, b.book, scoreById)),
      })),
    [enrichedCircles, scoreById, getBadgeForBook],
  );

  const lengthRows = useMemo(
    () =>
      LENGTH_BUCKETS.map((bucket) => ({
        title: bucket.label,
        items: enrichedCircles
          .filter((entry) => entry.lengthCategory === bucket.key)
          .map((entry) => ({
            book: entry.circle,
            chapter: 1,
            badge: getBadgeForBook(entry.circle.id),
            totalDots: entry.circle.chapters ?? 0,
          }))
          .sort((a, b) => scoreSort(a.book, b.book, scoreById)),
      })),
    [enrichedCircles, scoreById, getBadgeForBook],
  );

  const domainRows = useMemo(
    () =>
      DOMAIN_BUCKETS.map((bucket) => ({
        title: bucket.label,
        items: enrichedCircles
          .filter((entry) => entry.domainTags.includes(bucket.key))
          .map((entry) => ({
            book: entry.circle,
            chapter: 1,
            badge: getBadgeForBook(entry.circle.id),
            totalDots: entry.circle.chapters ?? 0,
          }))
          .sort((a, b) => scoreSort(a.book, b.book, scoreById)),
      })),
    [enrichedCircles, scoreById, getBadgeForBook],
  );

  if (isLoading) {
    return <BrowsePageSkeleton />;
  }

  if (error) {
    return <div className="p-6 text-gray-600">Error loading circles.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-10 px-4 pb-24 pt-0">
        <div className="space-y-0">
          <WelcomeSection userName={userName} />
          <CategoryChips />
          {currentCircleItem ? (
            <CurrentCircleHero
              studentId={studentId}
              collapseSignal={collapseHeroSignal}
              item={currentCircleItem}
              onOpenCircle={(book, chapter) =>
                onOpenCircle(book, Math.max(chapter || 1, 1))
              }
              onPlay={onPlayEpisode}
            />
          ) : null}
        </div>

        {showContinueRow && continueItems.length > 0 ? (
          <BrowseRow
            title="Continue talking"
            items={continueItems}
            onSelect={(item) => onOpenCircle(item.book, item.chapter)}
          />
        ) : null}

        {newItems.length > 0 ? (
          <BrowseRow
            title="New"
            items={newItems}
            onSelect={(item) => onOpenCircle(item.book, item.chapter)}
          />
        ) : null}

        {listenAgainItems.length > 0 ? (
          <BrowseRow
            title="Listen again"
            items={listenAgainItems}
            onSelect={(item) => onOpenCircle(item.book, item.chapter)}
          />
        ) : null}

        {themeRows
          .filter((row) => row.items.length > 0)
          .map((row) => (
            <BrowseRow
              key={`theme-${row.title}`}
              title={row.title}
              items={row.items}
              onSelect={(item) => onOpenCircle(item.book, item.chapter)}
            />
          ))}

        {moodRows
          .filter((row) => row.items.length > 0)
          .map((row) => (
            <BrowseRow
              key={`mood-${row.title}`}
              title={row.title}
              items={row.items}
              onSelect={(item) => onOpenCircle(item.book, item.chapter)}
            />
          ))}

        {lengthRows
          .filter((row) => row.items.length > 0)
          .map((row) => (
            <BrowseRow
              key={`length-${row.title}`}
              title={row.title}
              items={row.items}
              onSelect={(item) => onOpenCircle(item.book, item.chapter)}
            />
          ))}

        {domainRows
          .filter((row) => row.items.length > 0)
          .map((row) => (
            <BrowseRow
              key={`domain-${row.title}`}
              title={row.title}
              items={row.items}
              onSelect={(item) => onOpenCircle(item.book, item.chapter)}
            />
          ))}
      </div>
    </div>
  );
};

export default BrowsePage;
