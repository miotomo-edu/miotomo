import React from "react";
import { getBookSectionType } from "../../utils/bookUtils";

export type Book = {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  status: "new" | "started" | "read";
  progress: number;
  chapters: number;
  section_type: string;
};

type ChapterSelectorModalProps = {
  isOpen: boolean;
  book: Book | null;
  selectedChapter: number;
  onChapterChange: (chapter: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isUpdating?: boolean;
};

const ChapterSelectorModal: React.FC<ChapterSelectorModalProps> = ({
  isOpen,
  book,
  selectedChapter,
  onChapterChange,
  onConfirm,
  onCancel,
  isUpdating = false,
}) => {
  if (!isOpen || !book) return null;

  const sectionType = getBookSectionType(book.section_type);
  const currentProgress = book.progress || 1;

  // Create child-friendly question based on progress
  const getQuestionText = () => {
    if (currentProgress === 1 || book.status === "new") {
      return `Let's start reading ${book.title}! Which ${sectionType} would you like to begin with?`;
    } else {
      return `You were reading ${sectionType} ${currentProgress} of ${book.title}. Where have you reached now?`;
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center"
        style={{
          width: "100%",
          maxWidth: 400,
          margin: "0 16px",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent background click from closing when clicking inside
      >
        <h3 className="text-xl font-semibold mb-4 text-center">
          {getQuestionText()}
        </h3>
        <input
          type="number"
          min={1}
          max={book.chapters}
          value={selectedChapter}
          onChange={(e) => onChapterChange(Number(e.target.value))}
          className="border rounded px-3 py-2 text-lg mb-4 w-24 text-center"
          placeholder={currentProgress.toString()}
          disabled={isUpdating}
        />
        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            disabled={isUpdating}
            className="bg-purple-600 text-white px-6 py-2 rounded font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : "Let's go!"}
          </button>
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterSelectorModal;
