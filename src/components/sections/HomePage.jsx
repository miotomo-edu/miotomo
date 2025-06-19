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
  studentId,
}) {
  return (
    <div>
      <WelcomeSection userName={userName} />
      {selectedBook ? (
        <>
          <CurrentBookSection books={[selectedBook]} onContinue={onContinue} />
          <ReminderSection />
        </>
      ) : (
        <LibrarySection
          books={books}
          setBooks={setBooks}
          onBookSelect={onBookSelect}
          onContinue={onContinue}
          studentId={studentId}
        />
      )}
    </div>
  );
}

export default HomePage;
