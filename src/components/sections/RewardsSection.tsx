import React from "react";
import VisualVocabularyGame from "../features/vocabulary/VisualVocabularyGame";

type RewardsSectionProps = {
  onComplete?: () => void;
};

const RewardsSection: React.FC<RewardsSectionProps> = ({ onComplete }) => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <VisualVocabularyGame onComplete={onComplete} />
    </div>
  );
};

export default RewardsSection;
