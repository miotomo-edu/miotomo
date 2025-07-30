import React from "react";
import { Book } from "./LibrarySection";
import { characterData, Character } from "../../lib/characters";

type MapSectionProps = {
  book: Book;
  onSelectModality: (character: Character) => void;
  onBack: () => void;
};

const MapSection: React.FC<MapSectionProps> = ({
  book,
  onSelectModality,
  onBack,
}) => {
  return (
    <section className="py-6 px-4 pb-24 flex flex-col items-center w-full">
      <div
        className="relative w-full"
        style={{ height: `${characterData.length * 13}rem`, maxWidth: 600 }}
      >
        {characterData.map((character, idx) => (
          <button
            key={character.modality}
            onClick={() => onSelectModality(character)}
            className={`absolute flex flex-col items-center justify-center ${character.bg} hover:brightness-105 rounded-full w-44 h-44 shadow-md transition-all duration-200 focus:outline-none`}
            style={{
              ...(character.customBg
                ? { backgroundColor: character.customBg }
                : {}),
              left: `${character.x}%`,
              transform: "translateX(-50%)",
              top: `${idx * 13}rem`,
            }}
          >
            <img
              src={character.icon}
              alt={character.name}
              className="w-16 h-16 mb-2 object-contain"
            />
            <span className="font-bold text-lg mb-1">{character.name}</span>
            <span className="text-base font-medium text-gray-700">
              {character.modality}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MapSection;
