import React from "react";

type PreGameScreenProps = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onStart: () => void;
  backgroundImage: string;
  description?: string;
};

const PreGameScreen: React.FC<PreGameScreenProps> = ({
  title,
  subtitle,
  buttonLabel,
  onStart,
  backgroundImage,
  description,
}) => {
  return (
    <div className="relative flex min-h-full w-full flex-1 flex-col bg-white text-[#020617]">
      <div className="relative h-[42vh] w-full overflow-hidden rounded-b-[2rem]">
        <img
          src={backgroundImage}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-between px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-display max-w-2xl text-3xl font-extrabold tracking-tight text-[#020617] sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-xl text-lg text-[#020617]/60 sm:text-xl md:text-3xl">
              {description}
            </p>
          ) : null}
        </div>

        <div className="w-full max-w-sm">
          <p className="mb-3 text-xs uppercase tracking-super text-[#020617]/60">
            {subtitle}
          </p>
          <button
            type="button"
            onClick={onStart}
            className="w-full min-h-[3.25rem] rounded-full bg-brand-primary px-6 py-4 text-lg font-bold uppercase tracking-wide text-[#2a2629] shadow-elevated shadow-inset-highlight transition hover:brightness-[1.03] active:scale-[0.97] sm:min-h-[3.5rem] sm:text-xl"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreGameScreen;
