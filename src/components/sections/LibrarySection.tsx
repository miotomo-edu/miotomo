import React, { useEffect } from "react";
import BookGrid from "../features/BookGrid";
import { useBooks } from "../../hooks/useBooks";
import { Character } from "../../lib/characters";

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
  onBookAndCharacterSelect: (book: Book, character: Character) => void;
  onContinue: () => void;
  studentId: string;
  onBookSelectForMap: (
    book: Book,
    chapter: number,
    options?: {
      onChapterConfirmed?: (chapter: number) => void;
      skipChapterModal?: boolean;
    },
  ) => void;
  activeConversations?: Record<string, number>;
};

const LibrarySection: React.FC<LibrarySectionProps> = ({
  books,
  setBooks,
  onBookAndCharacterSelect,
  onContinue,
  studentId,
  onBookSelectForMap,
  activeConversations = {},
}) => {
  const {
    data: fetchedBooks,
    isLoading,
    error,
    updateBookProgress,
  } = useBooks(studentId);

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
      onBookSelectForMap(selected, initialChapter, {
        onChapterConfirmed: (chapter) => {
          if (studentId) {
            updateBookProgress({
              studentId,
              bookId: selected.id,
              progress: chapter,
            });
          }
        },
      });
    }
  };

  if (isLoading) return <div>Loading books...</div>;
  if (error) return <div>Error loading books.</div>;

  return (
    <section className="py-6 px-4 pb-24">
      <h2 className="text-xl font-semibold mb-4">My library</h2>
      <BookGrid books={fetchedBooks || books} onBookAction={handleBookAction} />
    </section>
  );
};

export default LibrarySection;
