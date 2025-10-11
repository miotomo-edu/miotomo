import React from "react";
import MiniBookCard from "./MiniBookCard";
import { Book } from "../sections/LibrarySection";

type BookGridProps = {
  books: Book[];
  onBookAction: (bookId: string) => void;
};

const BookGrid: React.FC<BookGridProps> = ({ books, onBookAction }) => (
  <div className="grid grid-cols-3 gap-6">
    {books.map((book) => (
      <MiniBookCard
        key={book.id}
        id={book.id} // Pass id explicitly
        thumbnailUrl={book.thumbnailUrl}
        title={book.title}
        onAction={onBookAction}
      />
    ))}
  </div>
);

export default BookGrid;
