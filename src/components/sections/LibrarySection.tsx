import React, { useEffect, useState } from "react";
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
  const { data: fetchedBooks, isLoading, error } = useBooks(studentId);

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
      setSelectedChapter(1);
    }
  };

  const handleChapterConfirm = () => {
    if (selectedBook) {
      onBookSelectForMap(selectedBook, selectedChapter);
      setShowChapterSelector(false);
      setSelectedBook(null);
    }
  };

  if (isLoading) return <div>Loading books...</div>;
  if (error) return <div>Error loading books.</div>;

  return (
    <section className="py-6 px-4 pb-24">
      <h2 className="text-3xl font-semibold mb-4">
        Pick a book and chat with Miotomo
      </h2>
      <BookGrid books={fetchedBooks || books} onBookAction={handleBookAction} />

      {/* Chapter Selector Popup */}
      {showChapterSelector && selectedBook && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          onClick={() => {
            setShowChapterSelector(false);
            setSelectedBook(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center"
            style={{
              width: "100%",
              maxWidth: 400,
              margin: "0 16px",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent background click from closing when clicking inside
          >
            <h3 className="text-xl font-bold mb-4">
              Which chapter have you reached in{" "}
              <span className="font-semibold">{selectedBook.title}</span>?
            </h3>
            <input
              type="number"
              min={1}
              max={20}
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="border rounded px-3 py-2 text-lg mb-4 w-24 text-center"
            />
            <div className="flex gap-4">
              <button
                onClick={handleChapterConfirm}
                className="bg-purple-600 text-white px-6 py-2 rounded font-semibold hover:bg-purple-700"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowChapterSelector(false);
                  setSelectedBook(null);
                }}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LibrarySection;
