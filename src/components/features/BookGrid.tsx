import React from "react";
import BookCard from "./BookCard";

type Book = {
  id: string;
  thumbnailUrl?: string;
  title: string;
  author: string;
};

type BookGridProps = {
  books: Book[];
  onBookAction: (bookId: string) => void;
};

const BookGrid: React.FC<BookGridProps> = ({ books, onBookAction }) => (
  <div className="grid grid-cols-2 gap-6">
    {books.map((book) => (
      <BookCard
        key={book.id}
        thumbnailUrl={book.thumbnailUrl}
        title={book.title}
        author={book.author}
        onAction={() => onBookAction(book.id)}
      />
    ))}
  </div>
);

export default BookGrid;
