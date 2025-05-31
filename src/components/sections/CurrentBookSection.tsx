import React from "react";
import SplitColorButton from "../common/SplitColorButton";
import { PlayIcon } from "../common/icons/PlayIcon";

type CurrentBookSectionProps = {
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  onContinue?: () => void;
};

const CurrentBookSection: React.FC<CurrentBookSectionProps> = ({
  bookTitle,
  bookAuthor,
  coverUrl,
  onContinue,
}) => (
  <section className="py-6 px-4 mb-6">
    <h2 className="text-xxl font-semibold">Continue talking to Tomo</h2>
    <p className="text-gray-600">Tomo can't wait to hear your thoughts!</p>

    {/* Main container */}
    <div className="flex items-stretch gap-4 mt-10">
      {/* Book cover - left side */}
      <div className="flex-shrink-0 w-1/4" data-id="current-book-cover">
        <div className="h-full w-full bg-gray-200 rounded overflow-hidden">
          <img
            src={coverUrl}
            alt={`${bookTitle} cover`}
            className="w-full h-full object-cover rounded"
          />
        </div>
      </div>

      {/* Book info and button - right side */}
      <div className="flex flex-col justify-between w-3/4" data-id="current-book-info">
        <div>
          <div className="text-xl font-bold">{bookTitle}</div>
          <div className="text-gray-500">by {bookAuthor}</div>
        </div>

        <SplitColorButton
          text="Continue talking"
          leftColor="#000"
          rightColor="#FAC304"
          split={37}
          onClick={onContinue}
          icon={<PlayIcon />}
        />
      </div>
    </div>
  </section>
);

export default CurrentBookSection;
