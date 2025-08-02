import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import ReminderSection from "./ReminderSection";
import LibrarySection from "./LibrarySection";
import { useStudent } from "../../hooks/useStudent";

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
  const { data: student } = useStudent(studentId);

  return (
    <div>
      <WelcomeSection userName={userName} streak={student?.streak || 0} />
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
