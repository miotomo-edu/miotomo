import WelcomeSection from "./WelcomeSection";
import CurrentBookSection from "./CurrentBookSection";
import SearchSection from "./SearchSection";
import LibrarySection from "./LibrarySection";

function LandingPage({ onContinue }) {
  return (
    <div>
      <WelcomeSection />
      <CurrentBookSection
        bookTitle="Gangsta Granny"
        bookAuthor="David Walliams"
        coverUrl="https://www.ibs.it/images/9780007371440_0_0_536_0_75.jpg"
        onContinue={onContinue}
      />
      {/* <SearchSection /> */}
      <LibrarySection />
    </div>
  );
}

export default LandingPage;
