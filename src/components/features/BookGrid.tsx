import React from "react";
import BookCard from "./BookCard";
import { Book } from "../sections/LibrarySection";

type BookGridProps = {
  books: Book[];
  onBookAction: (bookId: string) => void;
};

const BookGrid: React.FC<BookGridProps> = ({ books, onBookAction }) => (
  <div className="grid grid-cols-2 gap-6">
    {books.map((book) => (
      <BookCard
        key={book.id}
        {...book}
        onAction={() => onBookAction(book.id)}
      />
    ))}
  </div>
);

export default BookGrid;
