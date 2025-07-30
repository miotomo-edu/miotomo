import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import LibrarySection from "./LibrarySection";

function LibraryPage({
  setBooks,
  selectedBook,
  onBookAndCharacterSelect,
  onContinue,
  userName,
  studentId,
}) {
  // Update: onBookSelect now receives (book, modality)
  return (
    <div>
      <WelcomeSection userName={userName} />
      {selectedBook && (
        <CurrentBookSection books={[selectedBook]} onContinue={onContinue} />
      )}
      <LibrarySection
        setBooks={setBooks}
        onBookAndCharacterSelect={onBookAndCharacterSelect}
        onContinue={onContinue}
        studentId={studentId}
      />
    </div>
  );
}

export default LibraryPage;
