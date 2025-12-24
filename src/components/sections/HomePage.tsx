import React from "react";
import BrowsePage from "./BrowsePage";
import type { Book } from "./LibrarySection";

type HomePageProps = {
  userName: string;
  studentId: string;
  onOpenCircle: (book: Book, chapter: number) => void;
};

const HomePage: React.FC<HomePageProps> = ({
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

export default HomePage;
