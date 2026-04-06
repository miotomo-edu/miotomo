import React from "react";

type ProgressIconProps = {
  className?: string;
  strokeWidth?: number;
};

export const ProgressIcon: React.FC<ProgressIconProps> = ({
  className = "w-6 h-6",
  strokeWidth = 1.8,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 19V11" />
      <path d="M10 19V5" />
      <path d="M16 19V14" />
      <path d="M22 19V8" />
    </svg>
  );
};
