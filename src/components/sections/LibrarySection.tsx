import React, { useEffect, useState } from "react";
import BookGrid from "../features/BookGrid";
import { useBooks } from "../../hooks/useBooks";
import MapSection from "./MapSection";
import { Character } from "../../lib/characters";

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
  onBookAndCharacterSelect: (book: Book, character: Character) => void;
  onContinue: () => void;
  studentId: string;
};

const LibrarySection: React.FC<LibrarySectionProps> = ({
  books,
  setBooks,
  onBookAndCharacterSelect,
  onContinue,
  studentId,
}) => {
  const { data: fetchedBooks, isLoading, error } = useBooks(studentId);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    if (fetchedBooks && Array.isArray(fetchedBooks)) {
      setBooks(fetchedBooks);
    }
  }, [fetchedBooks, setBooks]);

  const handleBookAction = (bookId: string) => {
    const booksToUse = fetchedBooks || books;
    if (!Array.isArray(booksToUse)) return;
    const selected = booksToUse.find((b) => b.id === bookId);
    if (selected) setSelectedBook(selected);
  };

  const handleSelectModality = (character) => {
    if (selectedBook) {
      onBookAndCharacterSelect(selectedBook, character); // Pass character object
      onContinue();
      setSelectedBook(null);
    }
  };

  const handleBack = () => setSelectedBook(null);

  if (isLoading) return <div>Loading books...</div>;
  if (error) return <div>Error loading books.</div>;

  if (selectedBook) {
    return (
      <MapSection
        book={selectedBook}
        onSelectModality={handleSelectModality}
        onBack={handleBack}
      />
    );
  }

  return (
    <section className="py-6 px-4 pb-24">
      <h2 className="text-3xl font-semibold mb-4">
        Pick a book and chat with Miotomo
      </h2>
      <BookGrid books={fetchedBooks || books} onBookAction={handleBookAction} />
    </section>
  );
};

export default LibrarySection;
