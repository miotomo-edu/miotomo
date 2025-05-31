import React from "react";

type BookCardProps = {
  thumbnailUrl?: string;
  title: string;
  author: string;
  onAction: () => void;
};

const BookCard: React.FC<BookCardProps> = ({ thumbnailUrl, title, author, onAction }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full">
    <div className="w-full flex justify-center mb-2">
      <div className="w-24 aspect-[2/3] bg-gray-200 rounded flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover rounded" />
        ) : null}
      </div>
    </div>
    <div className="font-semibold text-left w-full">{title}</div>
    <div className="text-gray-500 text-sm text-left mb-2 w-full">{author}</div>
    <button
      className="mt-auto px-4 py-2 w-full"
      style={{ backgroundColor: "#FAC304", color: "#000", fontSize: "14px", borderRadius: "10px" }}
      onClick={onAction}
    >
      Let's talk
    </button>
  </div>
);

export default BookCard;
