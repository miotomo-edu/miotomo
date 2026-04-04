import React, { useEffect } from "react";
import BookGrid from "../features/BookGrid";
import { useBooks } from "../../hooks/useBooks";

export type Book = {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  status: "new" | "started" | "read";
  progress: number;
  chapters: number;
  section_type: string;
  lastReadDate?: string | null;
};

type LibrarySectionProps = {
  books: Book[];
  setBooks: (books: Book[]) => void;
  studentId: string;
  onOpenCircle: (book: Book, chapter: number) => void;
};

const S: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-black/[0.07] ${className}`} />
);

const LibrarySkeleton: React.FC = () => (
  <section className="px-4 py-6 pb-24">
    <S className="mb-4 h-7 w-28" />
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <S className="aspect-[3/4] w-full rounded-3xl" />
          <S className="h-3.5 w-3/4" />
          <S className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </section>
);

const LibrarySection: React.FC<LibrarySectionProps> = ({
  books,
  setBooks,
  studentId,
  onOpenCircle,
}) => {
  const { data: fetchedBooks, isLoading, error } = useBooks(studentId);

  useEffect(() => {
    if (fetchedBooks && Array.isArray(fetchedBooks)) {
      setBooks(fetchedBooks);
    }
  }, [fetchedBooks, setBooks]);

  const handleBookAction = (bookId: string) => {
    const booksToUse = fetchedBooks || books;
    if (!Array.isArray(booksToUse)) return;
    const selected = booksToUse.find((b) => b.id === bookId);
    if (selected) {
      const initialChapter = selected.progress || 1;
      onOpenCircle(selected, initialChapter);
    }
  };

  if (isLoading) return <LibrarySkeleton />;
  if (error) return <div>Error loading books.</div>;

  return (
    <section className="py-6 px-4 pb-24">
      <h2 className="text-xl font-semibold mb-4">My circles</h2>
      <BookGrid books={fetchedBooks || books} onBookAction={handleBookAction} />
    </section>
  );
};

export default LibrarySection;
