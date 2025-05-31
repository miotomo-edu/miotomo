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
  <section className="py-6 mb-6  px-4">
    <h2 className="text-3xl font-semibold mb-4">
      Continue chatting with Miotomo
    </h2>
    <div className="px-4 py-4 border-black border rounded-xl bg-white bg-opacity-0">
      {/* Main container */}
      <div className="flex items-stretch gap-4">
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
        <div
          className="flex flex-col justify-between w-3/4"
          data-id="current-book-info"
        >
          <div>
            <div className="text-xl font-bold">{bookTitle}</div>
            <div className="text-gray-500">by {bookAuthor}</div>
          </div>

          <SplitColorButton
            text="Continue talking"
            rightColor="#000"
            leftColor="#F78AD7"
            split={37}
            onClick={onContinue}
            icon={<PlayIcon />}
          />
        </div>
      </div>
    </div>
  </section>
);

export default CurrentBookSection;
