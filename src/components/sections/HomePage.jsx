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
  activeConversations = {},
}) {
  const { data: student } = useStudent(studentId);

  return (
    <div>
      <WelcomeSection userName={userName} />
      {selectedBook ? (
        <>
          <CurrentBookSection
            books={[selectedBook]}
            chapter={selectedChapter} // <-- pass chapter
            onContinue={(book, chapter) => onBookSelectForMap(book, chapter)}
            activeConversations={activeConversations}
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
          activeConversations={activeConversations}
        />
      )}
    </div>
  );
}

export default HomePage;
