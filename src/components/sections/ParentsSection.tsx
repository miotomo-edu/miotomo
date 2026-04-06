import React from "react";

const ParentsSection: React.FC = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[#F6EFE2] px-6 py-8 text-[#1C1C22]">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center rounded-3xl bg-white/80 p-8 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-super text-[#7B7264]">
          Tomo
        </p>
        <h1 className="mt-4 text-3xl font-bold">Coming soon</h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-[#4F4A42]">
          More Tomo experiences are on the way.
        </p>
      </div>
    </div>
  );
};

export default ParentsSection;
