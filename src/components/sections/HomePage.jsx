import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import ReminderSection from "./ReminderSection";
import LibrarySection from "./LibrarySection";

function HomePage({
  books,
  setBooks,
  selectedBook,
  selectedChapter,
  onBookAndCharacterSelect,
  onContinue,
  userName,
  studentId,
  onBookSelectForMap,
}) {
  return (
    <div>
      <WelcomeSection userName={userName} />
      {selectedBook ? (
        <>
          <CurrentBookSection
            books={[selectedBook]}
            chapter={selectedChapter} // <-- pass chapter
            onContinue={(book, chapter) => onBookSelectForMap(book, chapter)}
          />
          <ReminderSection />
        </>
      ) : (
        <LibrarySection
          books={books}
          setBooks={setBooks}
          onBookAndCharacterSelect={onBookAndCharacterSelect} // <-- update here
          onContinue={onContinue}
          studentId={studentId}
          onBookSelectForMap={onBookSelectForMap}
        />
      )}
    </div>
  );
}

export default HomePage;
