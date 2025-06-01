import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import ReminderSection from "./ReminderSection";
import LibrarySection from "./LibrarySection";

function HomePage({
  books,
  setBooks,
  selectedBook,
  onBookSelect,
  onContinue,
  userName,
}) {
  return (
    <div>
      <WelcomeSection userName={userName} />
      {selectedBook ? (
        <>
          <CurrentBookSection book={selectedBook} onContinue={onContinue} />
          <ReminderSection />
        </>
      ) : (
        <LibrarySection
          books={books}
          setBooks={setBooks}
          onBookSelect={onBookSelect}
          onContinue={onContinue}
        />
      )}
    </div>
  );
}

export default HomePage;
