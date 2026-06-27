import React from "react";
import VisualVocabularyGame from "../features/vocabulary/VisualVocabularyGame";
import type { PreviewScreen } from "../../lib/previewMode";
import type { Book } from "../../types";

type RewardsSectionProps = {
  onComplete?: () => void;
  previewScreen?: PreviewScreen | null;
  selectedBook?: Book | null;
  selectedChapter?: number | null;
};

const RewardsSection: React.FC<RewardsSectionProps> = ({
  onComplete,
  previewScreen,
  selectedBook = null,
  selectedChapter = null,
}) => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <VisualVocabularyGame
        onComplete={onComplete}
        previewMode={previewScreen ?? null}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
      />
    </div>
  );
};

export default RewardsSection;
