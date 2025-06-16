import React, { useEffect } from "react";
import BookGrid from "../features/BookGrid";
import { useBooks } from "../../hooks/useBooks"; // Adjust path as needed

export type Book = {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  status: "new" | "started" | "read";
  progress: number;
};

type LibrarySectionProps = {
  books: Book[];
  setBooks: (books: Book[]) => void;
  onBookSelect: (book: Book) => void;
  onContinue: () => void;
  studentId: string;
};

const LibrarySection: React.FC<LibrarySectionProps> = ({
  books,
  setBooks,
  onBookSelect,
  onContinue,
  studentId,
}) => {
  const { data: fetchedBooks, isLoading, error } = useBooks(studentId);
  // Update parent state when books are fetched
  useEffect(() => {
    if (fetchedBooks) {
      setBooks(fetchedBooks);
    }
  }, [fetchedBooks, setBooks]);

  const handleBookAction = (bookId: string) => {
    const updatedBooks = books.map((b) =>
      b.id === bookId ? { ...b, status: "started", progress: 28 } : b,
    );
    setBooks(updatedBooks);
    const selected = updatedBooks.find((b) => b.id === bookId);
    if (selected) onBookSelect(selected);
    onContinue();
  };

  if (isLoading) return <div>Loading books...</div>;
  if (error) return <div>Error loading books.</div>;

  return (
    <section className="py-6 px-4 pb-24">
      <h2 className="text-3xl font-semibold mb-4">
        Pick a book and chat with Miotomo
      </h2>
      <BookGrid books={fetchedBooks} onBookAction={handleBookAction} />
    </section>
  );
};

export default LibrarySection;
