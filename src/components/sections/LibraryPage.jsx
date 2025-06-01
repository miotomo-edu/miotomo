import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import SearchSection from "./SearchSection";
import LibrarySection from "./LibrarySection";

function LibraryPage({ onContinue, selectedBook, onBookSelect }) {
  return (
    <div>
      <WelcomeSection />
      {selectedBook && (
        <CurrentBookSection book={selectedBook} onContinue={onContinue} />
      )}
      {/* <SearchSection /> */}
      <LibrarySection onBookSelect={onBookSelect} />
    </div>
  );
}

export default LibraryPage;
