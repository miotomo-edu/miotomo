import discussionCompleteTomo from "../../../assets/img/tomo-discussion-complete-raised-arms.webp";

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
            style={
              prefersReducedMotion ? undefined : { animationDelay: "80ms" }
            }
          />

          <div
            className={`mt-6 max-w-2xl space-y-3 ${entryClass}`}
            style={
              prefersReducedMotion ? undefined : { animationDelay: "150ms" }
            }
          >
            <p className="text-sm font-black uppercase tracking-[0.32em] text-white/80 md:text-lg">
              Great job
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Discussion complete!
            </h2>
            <p className="mx-auto max-w-xl text-xl font-semibold leading-8 text-white/90 md:text-3xl md:leading-10">
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
            className="discussion-complete-splash__button w-full rounded-full px-8 py-4 text-lg font-bold uppercase tracking-wider text-[#2a2629] shadow-elevated shadow-inset-highlight transition hover:brightness-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 md:px-10 md:py-5 md:text-xl"
          >
            {isContinuing ? "Opening vocabulary..." : "Go to Vocabulary"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCompleteSplash;
