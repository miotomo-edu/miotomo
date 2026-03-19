import React from "react";

const CHIP_LABELS = ["History", "Science", "Imagination"];

const CategoryChips: React.FC = () => {
  return (
    <section className="px-4 pb-7">
      <div className="flex flex-wrap gap-3">
        {CHIP_LABELS.map((label) => (
          <button
            key={label}
            type="button"
            className="rounded-full border-2 border-black px-6 py-3 text-2xl leading-none text-black transition hover:bg-black/5"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-3 rounded-full border-2 border-black px-5 py-3 text-2xl leading-none text-black transition hover:bg-black/5"
        >
          <span
            aria-hidden="true"
            className="inline-block h-0 w-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-black"
          />
          <span>Categories</span>
        </button>
      </div>
    </section>
  );
};

export default CategoryChips;
