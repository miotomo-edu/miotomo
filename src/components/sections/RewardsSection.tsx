import React from "react";
import VisualVocabularyGame from "../features/vocabulary/VisualVocabularyGame";
import type { PreviewScreen } from "../../lib/previewMode";

type RewardsSectionProps = {
  onComplete?: () => void;
  previewScreen?: PreviewScreen | null;
};

const RewardsSection: React.FC<RewardsSectionProps> = ({
  onComplete,
  previewScreen,
}) => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <VisualVocabularyGame
        onComplete={onComplete}
        previewMode={previewScreen ?? null}
      />
    </div>
  );
};

export default RewardsSection;
