import discussionCompleteTomo from "../../../assets/img/tomo-discussion-complete-raised-arms.png";

type DiscussionCompleteSplashProps = {
  onContinue: () => void;
  isContinuing?: boolean;
};

const DiscussionCompleteSplash = ({
  onContinue,
  isContinuing = false,
}: DiscussionCompleteSplashProps) => {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const entryClass = prefersReducedMotion ? "" : "animate-fade-in";

  return (
    <div className="absolute inset-0 z-40 overflow-hidden bg-white/12 text-white backdrop-blur-xl">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,24,0.18)_0%,rgba(10,14,24,0.32)_100%)]" />

      <div className="relative flex min-h-screen flex-col px-6 pb-8 pt-10 md:px-10 md:pb-10">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center text-center">
          <img
            src={discussionCompleteTomo}
            alt="Tomo with raised arms celebrating"
            className={`h-52 w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.28)] md:h-64 ${entryClass}`}
            style={prefersReducedMotion ? undefined : { animationDelay: "80ms" }}
          />

          <div
            className={`mt-6 max-w-2xl space-y-3 ${entryClass}`}
            style={prefersReducedMotion ? undefined : { animationDelay: "150ms" }}
          >
            <p className="text-xs font-black uppercase tracking-[0.32em] text-white/75">
              Great job
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Discussion complete!
            </h2>
            <p className="mx-auto max-w-xl text-base font-medium leading-relaxed text-white/88 md:text-xl">
              Tomo is ready for the next challenge. Let&apos;s jump into the
              vocabulary game.
            </p>
          </div>
        </div>

        <div
          className={`mx-auto w-full max-w-3xl ${entryClass}`}
          style={prefersReducedMotion ? undefined : { animationDelay: "220ms" }}
        >
          <button
            type="button"
            onClick={onContinue}
            disabled={isContinuing}
            className="w-full rounded-[1.75rem] border border-white/30 bg-white/18 px-6 py-5 text-lg font-black text-white shadow-[0_22px_45px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:bg-white/22 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 md:text-xl"
          >
            {isContinuing ? "Opening vocabulary..." : "Go to Vocabulary"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCompleteSplash;
