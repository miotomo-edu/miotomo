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
    <div className="relative flex min-h-full w-full flex-1 flex-col overflow-hidden bg-black text-[#f7f0e6]">
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute left-0 right-0 top-0 h-[env(safe-area-inset-top)] bg-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141216] via-[#141216]/70 to-[#141216]/20" />
        <div
          className="absolute left-0 right-0 top-0 bg-[linear-gradient(to_bottom,#2F2C2F,transparent)]"
          style={{ height: "50px" }}
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-1 flex-col items-center justify-between px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(3rem+env(safe-area-inset-top))] text-center">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-5">
          <h1 className="font-display max-w-2xl text-3xl font-extrabold tracking-tight text-[#f7f0e6] drop-shadow-[0_6px_24px_rgba(0,0,0,1)] sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-xl text-lg text-[#efe6d6]/80 drop-shadow-[0_4px_12px_rgba(0,0,0,1)] sm:text-xl md:text-3xl">
              {description}
            </p>
          ) : null}
        </div>

        <div className="w-full max-w-sm">
          <p className="mb-3 text-xs uppercase tracking-super text-[#efe6d6]/70 drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">
            {subtitle}
          </p>
          <button
            type="button"
            onClick={onStart}
            className="w-full min-h-[3.25rem] rounded-full border-2 border-[#DACDB9] bg-[#C0B095] px-6 py-4 text-lg font-bold uppercase tracking-wide text-[#2a2629] shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition hover:brightness-[1.03] active:scale-[0.97] sm:min-h-[3.5rem] sm:text-xl"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreGameScreen;
