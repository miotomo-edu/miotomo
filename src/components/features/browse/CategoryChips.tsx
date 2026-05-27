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
            className={`rounded-full bg-ochre-400 px-5 py-2.5 text-base font-bold leading-none text-motara-950 shadow-inset-highlight transition hover:brightness-[1.03] active:scale-[0.97]${i >= 2 ? " hidden sm:inline-flex" : ""}`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-parchment-150/20 bg-parchment-150/8 px-5 py-2.5 text-base font-semibold leading-none text-parchment-150 transition hover:bg-parchment-150/14 active:scale-[0.97]"
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
