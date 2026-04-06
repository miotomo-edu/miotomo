import type { Book } from "../components/sections/LibrarySection";

export type PreviewScreen =
  | "vocab-intro"
  | "vocab-game"
  | "dot-complete"
  | "circle-complete"
  | "vocab-complete"
  | "spelling-intro"
  | "spelling-game"
  | "spelling-complete";

export type PreviewConfig = {
  screen: PreviewScreen;
  userName: string;
  completedDot: number;
  totalDots: number;
  book: Book;
};

const PREVIEW_SCREENS: PreviewScreen[] = [
  "vocab-intro",
  "vocab-game",
  "dot-complete",
  "circle-complete",
  "vocab-complete",
  "spelling-intro",
  "spelling-game",
  "spelling-complete",
];

const DEFAULT_PREVIEW_NAME = "friend";
const DEFAULT_PREVIEW_BOOK_TITLE = "Preview Circle";

const parsePositiveInteger = (value: string | null, fallback: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.round(numeric));
};

export const getPreviewConfig = (
  search: string = typeof window !== "undefined" ? window.location.search : "",
): PreviewConfig | null => {
  const params = new URLSearchParams(search);
  const previewValue = params.get("preview")?.trim().toLowerCase();

  if (!previewValue || !PREVIEW_SCREENS.includes(previewValue as PreviewScreen)) {
    return null;
  }

  const screen = previewValue as PreviewScreen;
  const completedDot = parsePositiveInteger(params.get("previewDot"), 1);
  const requestedTotalDots = parsePositiveInteger(
    params.get("previewTotalDots"),
    screen === "circle-complete" ? completedDot : completedDot + 2,
  );
  const totalDots =
    screen === "circle-complete"
      ? Math.max(requestedTotalDots, completedDot)
      : Math.max(requestedTotalDots, completedDot + 1);
  const userName = params.get("previewName")?.trim() || DEFAULT_PREVIEW_NAME;
  const bookTitle = params.get("previewBookTitle")?.trim() || DEFAULT_PREVIEW_BOOK_TITLE;
  const book: Book = {
    id: `preview-${screen}`,
    title: bookTitle,
    author: "Miotomo",
    thumbnailUrl: "",
    status: "started",
    progress: Math.min(completedDot + 1, totalDots),
    chapters: screen === "circle-complete" ? completedDot : totalDots,
    section_type: "circle",
  };

  return {
    screen,
    userName,
    completedDot,
    totalDots: book.chapters,
    book,
  };
};
