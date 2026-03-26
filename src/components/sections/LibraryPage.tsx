import React from "react";
import BrowsePage from "./BrowsePage";
import type { Book } from "./LibrarySection";

type LibraryPageProps = {
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
};

const LibraryPage: React.FC<LibraryPageProps> = ({
  userName,
  studentId,
  collapseHeroSignal = 0,
  onOpenCircle,
  onPlayEpisode,
}) => {
  return (
    <BrowsePage
      userName={userName}
      studentId={studentId}
      collapseHeroSignal={collapseHeroSignal}
      onOpenCircle={onOpenCircle}
      onPlayEpisode={onPlayEpisode}
      showContinueRow={false}
    />
  );
};

export default LibraryPage;
