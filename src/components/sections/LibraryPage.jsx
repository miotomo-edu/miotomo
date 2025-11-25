import { useMemo } from "react";
import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import LibrarySection from "./LibrarySection";
import { useStudent } from "../../hooks/useStudent";

function LibraryPage({
  books = [],
  setBooks,
  selectedBook,
  selectedChapter,
  onBookAndCharacterSelect,
  onContinue,
  userName,
  studentId,
  onBookSelectForMap,
  activeConversations = {},
}) {
  const { data: student } = useStudent(studentId);

  const lastReadBook = useMemo(() => {
    if (!Array.isArray(books) || books.length === 0) return null;

    const withReadDate = books
      .filter((book) => Boolean(book.lastReadDate))
      .sort((a, b) => {
        const aTime = a.lastReadDate ? Date.parse(a.lastReadDate) : Number.NEGATIVE_INFINITY;
        const bTime = b.lastReadDate ? Date.parse(b.lastReadDate) : Number.NEGATIVE_INFINITY;
        const safeATime = Number.isNaN(aTime) ? Number.NEGATIVE_INFINITY : aTime;
        const safeBTime = Number.isNaN(bTime) ? Number.NEGATIVE_INFINITY : bTime;
        return safeBTime - safeATime;
      });

    if (withReadDate.length > 0) {
      return withReadDate[0];
    }

    const startedBook = books.find((book) => book.status === "started");
    if (startedBook) return startedBook;

    return books[0] ?? null;
  }, [books]);

  const featuredBook = lastReadBook || selectedBook || null;
  const featuredChapter = featuredBook
    ? Math.max(featuredBook.progress ?? 1, 1)
    : Math.max(selectedChapter ?? 1, 1);

  return (
    <div>
      <WelcomeSection userName={userName} streak={student?.streak || 0} />
      {featuredBook && (
        <CurrentBookSection
          books={[featuredBook]}
          chapter={featuredChapter}
          onContinue={(book, chapter) => {
            onBookSelectForMap(book, chapter);
          }}
          activeConversations={activeConversations}
        />
      )}
      <LibrarySection
        books={books}
        setBooks={setBooks}
        onBookAndCharacterSelect={onBookAndCharacterSelect}
        onContinue={onContinue}
        studentId={studentId}
        onBookSelectForMap={onBookSelectForMap}
        activeConversations={activeConversations}
      />
    </div>
  );
}

export default LibraryPage;
