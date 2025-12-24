import React from "react";
import BrowsePage from "./BrowsePage";
import type { Book } from "./LibrarySection";

type LibraryPageProps = {
  userName: string;
  studentId: string;
  onOpenCircle: (book: Book, chapter: number) => void;
};

const LibraryPage: React.FC<LibraryPageProps> = ({
  userName,
  studentId,
  onOpenCircle,
}) => {
  return (
    <BrowsePage
      userName={userName}
      studentId={studentId}
      onOpenCircle={onOpenCircle}
    />
  );
};

export default LibraryPage;
