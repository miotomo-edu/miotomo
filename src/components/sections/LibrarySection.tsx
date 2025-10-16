import React, { useEffect, useState } from "react";
import BookGrid from "../features/BookGrid";
import ChapterSelectorModal from "../common/ChapterSelectorModal";
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
  onBookSelectForMap: (book: Book, chapter: number) => void; // updated
};

const LibrarySection: React.FC<LibrarySectionProps> = ({
  books,
  setBooks,
  onBookAndCharacterSelect,
  onContinue,
  studentId,
  onBookSelectForMap,
}) => {
  const {
    data: fetchedBooks,
    isLoading,
    error,
    updateBookProgress,
    isUpdating,
  } = useBooks(studentId);
  // Chapter selector state
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);

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
      setSelectedBook(selected);
      setShowChapterSelector(true);
      setSelectedChapter(selected.progress || 1);
    }
  };

  const handleChapterConfirm = async () => {
    if (selectedBook && studentId) {
      try {
        // Update progress in database
        updateBookProgress({
          studentId,
          bookId: selectedBook.id,
          progress: selectedChapter,
        });

        // Continue with the book selection
        onBookSelectForMap(selectedBook, selectedChapter);
        handleModalClose();
      } catch (error) {
        console.error("Failed to update book progress:", error);
        // Still continue with the flow even if update fails
        onBookSelectForMap(selectedBook, selectedChapter);
        handleModalClose();
      }
    }
  };

  const handleModalClose = () => {
    setShowChapterSelector(false);
    setSelectedBook(null);
  };

  const handleChapterChange = (chapter: number) => {
    setSelectedChapter(chapter);
  };

  if (isLoading) return <div>Loading books...</div>;
  if (error) return <div>Error loading books.</div>;

  return (
    <section className="py-6 px-4 pb-24">
      <h2 className="text-xl font-semibold mb-4">My library</h2>
      <BookGrid books={fetchedBooks || books} onBookAction={handleBookAction} />

      <ChapterSelectorModal
        isOpen={showChapterSelector}
        book={selectedBook}
        selectedChapter={selectedChapter}
        onChapterChange={handleChapterChange}
        onConfirm={handleChapterConfirm}
        onCancel={handleModalClose}
        isUpdating={isUpdating}
      />
    </section>
  );
};

export default LibrarySection;
