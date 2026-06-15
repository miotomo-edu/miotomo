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
            className={`rounded-full px-5 py-2.5 text-base font-semibold leading-none transition active:scale-[0.97]${i === 0 ? " bg-[#b6c356] text-[#1a1a1a]" : " !bg-transparent border border-white/35 text-white hover:!bg-white/10"}${i >= 2 ? " hidden sm:inline-flex" : ""}`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-white/35 !bg-transparent px-5 py-2.5 text-base font-semibold leading-none text-white transition hover:!bg-white/10 active:scale-[0.97]"
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
