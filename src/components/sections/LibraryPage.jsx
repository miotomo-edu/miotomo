import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import LibrarySection from "./LibrarySection";
import { useStudent } from "../../hooks/useStudent";

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
  const { data: student } = useStudent(studentId);

  return (
    <div>
      <WelcomeSection userName={userName} streak={student?.streak || 0} />
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
