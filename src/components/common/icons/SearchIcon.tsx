import React from "react";

export const SearchIcon = ({ className = "" }) => (
  <svg
    className={`inline-block w-[1em] h-[1em] ${className}`}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx="9" cy="9" r="7" />
    <line x1="15" y1="15" x2="19" y2="19" strokeLinecap="round" />
  </svg>
);
