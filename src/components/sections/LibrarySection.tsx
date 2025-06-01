import React, { useState } from "react";
import BookGrid from "../features/BookGrid";

export type Book = {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  status: "new" | "started" | "read";
  progress: number; // 0 to 100
};

const mockBooks: Book[] = [
  {
    id: "1",
    title: "Gangsta Granny",
    author: "David Walliams",
    thumbnailUrl: "https://www.ibs.it/images/9780007371440_0_0_536_0_75.jpg",
    status: "started",
    progress: 27,
  },
  {
    id: "2",
    title: "The Lion, the Witch and the Wardrobe",
    author: "C.S. Lewis",
    thumbnailUrl: "https://www.ibs.it/images/9780007325054_0_0_536_0_75.jpg",
    status: "new",
    progress: 0,
  },
  {
    id: "3",
    title: "Charlotte's Web",
    author: "E.B. White",
    thumbnailUrl: "https://www.ibs.it/images/9780061124952_0_0_536_0_75.jpg",
    status: "new",
    progress: 0,
  },
  {
    id: "4",
    title: "Kensuke's Kingdom",
    author: "Michael Morpurgo",
    thumbnailUrl: "https://www.ibs.it/images/9781780312903_0_0_536_0_75.jpg",
    status: "new",
    progress: 0,
  },
  {
    id: "5",
    title: "The Iron Man",
    author: "Ted Hughes",
    thumbnailUrl: "https://www.ibs.it/images/9780571289103_0_0_0_350_75.jpg",
    status: "new",
    progress: 0,
  },
  {
    id: "6",
    title: "Matilda",
    author: "Roald Dahl",
    thumbnailUrl: "https://www.ibs.it/images/9780241610992_0_0_0_350_75.jpg",
    status: "new",
    progress: 0,
  },
  {
    id: "7",
    title: "Varjak Paw",
    author: "S.F. Said",
    thumbnailUrl: "https://www.ibs.it/images/9781409047667_0_0_0_350_75.jpg",
    status: "new",
    progress: 0,
  },
  {
    id: "8",
    title: "The Jungle Book",
    author: "Rudyard Kipling",
    thumbnailUrl: "https://www.ibs.it/images/9780241739020_0_0_536_0_75.jpg",
    status: "new",
    progress: 0,
  },
];

const LibrarySection: React.FC<{ onBookSelect: (book: BookType) => void }> = ({
  onBookSelect,
}) => {
  const [books] = useState<BookType[]>(mockBooks);

  const handleBookAction = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (book) onBookSelect(book);
  };

  return (
    <section className="py-6 px-4">
      <h2 className="text-3xl font-semibold mb-4">
        You have {books.length} books in your bookshelf
      </h2>
      <BookGrid books={books} onBookAction={handleBookAction} />
    </section>
  );
};

export default LibrarySection;
