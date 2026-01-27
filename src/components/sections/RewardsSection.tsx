import React from "react";
// import VisualVocabularyGame from "../features/vocabulary/VisualVocabularyGame";
import VisualSpellingGame from "../features/spelling/VisualSpellingGame";
const RewardsSection: React.FC = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <VisualSpellingGame />
    </div>
  );
};

export default RewardsSection;
