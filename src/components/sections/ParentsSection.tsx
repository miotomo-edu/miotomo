import React from "react";

const ParentsSection: React.FC = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-parchment-100 px-6 py-8 text-motara-950">
      <div className="mio-panel mio-surface mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center" data-raised="true">
        <p className="mio-eyebrow text-motara-700">
          Tomo
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-motara-950">Coming soon</h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-motara-700">
          More Tomo experiences are on the way.
        </p>
      </div>
    </div>
  );
};

export default ParentsSection;
