import React from "react";

type PreGameScreenProps = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onStart: () => void;
  backgroundImage: string;
  description?: string;
  lightBackground?: boolean;
};

const PreGameScreen: React.FC<PreGameScreenProps> = ({
  title,
  subtitle,
  buttonLabel,
  onStart,
  backgroundImage,
  description,
  lightBackground = false,
}) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt=""
          className="h-full w-full object-cover"
        />
        {lightBackground ? (
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-white via-white/90 to-transparent" />
        ) : (
          <>
            <div className="absolute left-0 right-0 top-0 h-[env(safe-area-inset-top)] bg-black" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141216] via-[#141216]/70 to-[#141216]/20" />
          </>
        )}
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-1 flex-col items-center justify-end px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(3rem+env(safe-area-inset-top))] text-center">
        <div className="flex w-full max-w-xl flex-col items-center gap-4">
          <h1
            className={`font-display max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl ${
              lightBackground
                ? "text-[#020617]"
                : "text-[#f7f0e6] drop-shadow-[0_6px_24px_rgba(0,0,0,1)]"
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={`max-w-xl text-lg sm:text-xl md:text-3xl ${
                lightBackground
                  ? "text-[#020617]/70"
                  : "text-[#efe6d6]/80 drop-shadow-[0_4px_12px_rgba(0,0,0,1)]"
              }`}
            >
              {description}
            </p>
          ) : null}
          <div className="mt-2 w-full">
            {/*<p
              className={`mb-3 text-xs uppercase tracking-super ${
                lightBackground
                  ? "text-[#020617]/60"
                  : "text-[#efe6d6]/70 drop-shadow-[0_4px_10px_rgba(0,0,0,1)]"
              }`}
            >
              {subtitle}
            </p>*/}
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
    </div>
  );
};

export default PreGameScreen;
