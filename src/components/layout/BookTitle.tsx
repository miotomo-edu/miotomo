import React from "react";

type BookTitleProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

const BookTitle = ({ title, subtitle, onBack }) => (
  <div className="w-full px-6 py-4 flex items-start">
    {/* Back button, top-aligned */}
    <button
      onClick={onBack}
      className="w-10 h-10 rounded-full bg-pink-400 flex items-center justify-center mr-8 mt-1"
      aria-label="Back"
      type="button"
      style={{ flexShrink: 0 }}
    >
      {/* Arrow icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13 16L7 10L13 4"
          stroke="#000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
    <div>
      <h1 className="text-black text-2xl font-bold">{title}</h1>
      {subtitle && (
        <div className="text-base font-medium text-gray-600 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  </div>
);

export default BookTitle;
