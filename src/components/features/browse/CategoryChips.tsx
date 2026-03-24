import React from "react";

const CHIPS = [
  { label: "History", bg: "#FF8C42", text: "#fff" },
  { label: "Science", bg: "#10B981", text: "#fff" },
  { label: "Imagination", bg: "#8B5CF6", text: "#fff" },
];

const CategoryChips: React.FC = () => {
  return (
    <section className="px-4 pb-7">
      <div className="flex flex-wrap gap-3">
        {CHIPS.map(({ label, bg, text }) => (
          <button
            key={label}
            type="button"
            className="rounded-full px-6 py-3 text-2xl font-semibold leading-none transition active:scale-95"
            style={{ backgroundColor: bg, color: text }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-3 rounded-full border-2 border-black/15 bg-black/5 px-5 py-3 text-2xl font-semibold leading-none text-gray-700 transition hover:bg-black/10 active:scale-95"
        >
          <span
            aria-hidden="true"
            className="inline-block h-0 w-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-gray-600"
          />
          <span>Categories</span>
        </button>
      </div>
    </section>
  );
};

export default CategoryChips;
