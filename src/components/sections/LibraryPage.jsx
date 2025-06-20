import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
// import SearchSection from "./SearchSection";
import LibrarySection from "./LibrarySection";

function LibraryPage({
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
      {selectedBook && (
        <CurrentBookSection books={[selectedBook]} onContinue={onContinue} />
      )}
      <LibrarySection
        setBooks={setBooks}
        onBookSelect={onBookSelect}
        onContinue={onContinue}
        studentId={studentId}
      />
    </div>
  );
}

export default LibraryPage;
