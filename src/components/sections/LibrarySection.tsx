import React, { useState } from "react";
import BookGrid from "../features/BookGrid";

const mockBooks = [
  {
    id: "1",
    title: "Gangsta Granny",
    author: "David Walliams",
    thumbnailUrl: "https://www.ibs.it/images/9780007371440_0_0_536_0_75.jpg",
  },
  {
    id: "2",
    title: "The Lion, the Witch and the Wardrobe",
    author: "C.S. Lewis",
    thumbnailUrl: "https://www.ibs.it/images/9780007325054_0_0_536_0_75.jpg",
  },
  {
    id: "3",
    title: "Charlotte's Web",
    author: "E.B. White",
    thumbnailUrl: "https://www.ibs.it/images/9780061124952_0_0_536_0_75.jpg",
  },
  {
    id: "4",
    title: "Kensuke's Kingdom",
    author: "Michael Morpurgo",
    thumbnailUrl: "https://www.ibs.it/images/9781780312903_0_0_536_0_75.jpg",
  },
  {
    id: "5",
    title: "The Iron Man",
    author: "Ted Hughes",
    thumbnailUrl: "https://www.ibs.it/images/9780571289103_0_0_0_350_75.jpg",
  },
  {
    id: "6",
    title: "Matilda",
    author: "Roald Dahl",
    thumbnailUrl: "https://www.ibs.it/images/9780241610992_0_0_0_350_75.jpg",
  },
  {
    id: "7",
    title: "Varjak Paw",
    author: "S.F. Said",
    thumbnailUrl: "https://www.ibs.it/images/9781409047667_0_0_0_350_75.jpg",
  },
  {
    id: "8",
    title: "The Jungle Book",
    author: "Rudyard Kipling",
    thumbnailUrl: "https://www.ibs.it/images/9780241739020_0_0_536_0_75.jpg",
  },
];

const LibrarySection: React.FC = () => {
  const [books] = useState(mockBooks);

  const handleBookAction = (bookId: string) => {
    // Placeholder for book action (e.g., open details)
    alert(`Book action for book ID: ${bookId}`);
  };

  return (
    <section className="py-6 px-4">
      <h2 className="text-xl font-semibold mb-4">Library</h2>
      <BookGrid books={books} onBookAction={handleBookAction} />
    </section>
  );
};

export default LibrarySection;
