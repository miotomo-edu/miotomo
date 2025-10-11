import React from "react";

type ProgressBarProps = {
  leftColor: string;
  rightColor: string;
  split: number; // Percentage from 0 to 100
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  leftColor,
  rightColor,
  split,
}) => {
  // Ensure split is within 0-100 range
  const clampedSplit = Math.max(0, Math.min(100, split));

  return (
    <div
      className="relative w-full h-[5px] rounded overflow-hidden mt-2" // 100% width, 5px high, rounded corners, margin-top for spacing
      style={{ backgroundColor: rightColor }} // Default background for the "right" color
    >
      <div
        className="absolute top-0 left-0 h-full rounded-l" // Left part of the progress bar
        style={{
          width: `${clampedSplit}%`,
          backgroundColor: leftColor,
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
