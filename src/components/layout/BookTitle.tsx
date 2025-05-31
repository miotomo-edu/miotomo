import React from "react";

const BookTitle = ({ title, subtitle }) => (
  <div className="w-full bg-assistantBubble px-6 py-4">
    <h1 className="text-black text-2xl font-bold">{title}</h1>
    {subtitle && (
      <div className="text-base font-medium text-gray-600 mt-1">{subtitle}</div>
    )}
  </div>
);

export default BookTitle;
