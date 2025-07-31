import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import LibrarySection from "./LibrarySection";

function LibraryPage({
  setBooks,
  selectedBook,
  selectedChapter,
  onBookAndCharacterSelect,
  onContinue,
  userName,
  studentId,
  onBookSelectForMap,
}) {
  // Update: onBookSelect now receives (book, modality)
  return (
    <div>
      <WelcomeSection userName={userName} />
      {selectedBook && (
        <CurrentBookSection
          books={[selectedBook]}
          chapter={selectedChapter}
          onContinue={(book, chapter) => {
            onBookSelectForMap(book, chapter);
          }}
        />
      )}
      <LibrarySection
        setBooks={setBooks}
        onBookAndCharacterSelect={onBookAndCharacterSelect}
        onContinue={onContinue}
        studentId={studentId}
        onBookSelectForMap={onBookSelectForMap}
      />
    </div>
  );
}

export default LibraryPage;
