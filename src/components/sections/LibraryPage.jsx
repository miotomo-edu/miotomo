import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import SearchSection from "./SearchSection";
import LibrarySection from "./LibrarySection";

function LibraryPage({
  books,
  setBooks,
  selectedBook,
  onBookSelect,
  onContinue,
}) {
  return (
    <div>
      <WelcomeSection />
      {selectedBook && (
        <CurrentBookSection book={selectedBook} onContinue={onContinue} />
      )}
      <LibrarySection
        books={books}
        setBooks={setBooks}
        onBookSelect={onBookSelect}
        onContinue={onContinue}
      />
    </div>
  );
}

export default LibraryPage;
