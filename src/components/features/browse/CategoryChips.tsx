import React from "react";

const CHIPS = ["History", "Science", "Imagination"];

const CategoryChips: React.FC = () => {
  return (
    <section className="pb-0">
      <div className="flex flex-wrap gap-2.5">
        {CHIPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`rounded-full bg-[#1C1C22] px-5 py-2.5 text-base font-semibold leading-none text-white transition active:scale-[0.97] hover:bg-[#2a2a33]${i >= 2 ? " hidden sm:inline-flex" : ""}`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-[#1C1C22]/20 bg-transparent px-5 py-2.5 text-base font-semibold leading-none text-[#1C1C22] transition hover:bg-[#1C1C22]/8 active:scale-[0.97]"
        >
          <span>All</span>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default CategoryChips;
