import React, { useMemo } from "react";
import type { Book } from "./LibrarySection";
import CircleDotsSymbol from "../features/browse/CircleDotsSymbol";
import tomoCelebrating from "../../assets/img/tomo-celebrating.png";

type DotCompletionPageProps = {
  book: Book;
  userName: string;
  completedEpisode: number;
  onPreviewNextDot: (book: Book, episode: number) => void;
};

const burstPositions = [
  "left-[3%] top-[22%]",
  "left-[9%] top-[40%]",
  "left-[14%] top-[66%]",
  "left-[22%] top-[30%]",
  "left-[78%] top-[26%]",
  "left-[84%] top-[42%]",
  "left-[88%] top-[62%]",
  "left-[73%] top-[68%]",
  "left-[67%] top-[36%]",
  "left-[29%] top-[74%]",
];

const sparklePositions = [
  "left-[11%] top-[28%]",
  "left-[17%] top-[53%]",
  "left-[26%] top-[18%]",
  "left-[32%] top-[62%]",
  "left-[70%] top-[19%]",
  "left-[76%] top-[57%]",
  "left-[83%] top-[33%]",
  "left-[89%] top-[52%]",
];

const confettiPalette = [
  "bg-[#ff7b92]",
  "bg-[#ffd44d]",
  "bg-[#63c4ff]",
  "bg-[#7bd66a]",
  "bg-[#f8a4e2]",
  "bg-[#ffb94d]",
];

const getFirstName = (value: string) => {
  const first = value.trim().split(/\s+/)[0];
  return first || "friend";
};

const FireworkBurst: React.FC<{ className: string }> = ({ className }) => (
  <div className={`absolute h-12 w-12 ${className}`} aria-hidden="true">
    <div className="absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary" />
    <div className="absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-brand-primary" />
    <div className="absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rotate-90 rounded-full bg-brand-primary" />
    <div className="absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rotate-[135deg] rounded-full bg-brand-primary" />
  </div>
);

const Sparkle: React.FC<{ className: string }> = ({ className }) => (
  <div className={`absolute h-4 w-4 ${className}`} aria-hidden="true">
    <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rounded-full bg-brand-primary" />
    <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-brand-primary" />
  </div>
);

const DotCompletionPage: React.FC<DotCompletionPageProps> = ({
  book,
  userName,
  completedEpisode,
  onPreviewNextDot,
}) => {
  const totalDots = Math.max(Number(book.chapters) || 0, completedEpisode);
  const nextEpisode =
    completedEpisode < totalDots ? completedEpisode + 1 : null;
  const remainingDots = Math.max(totalDots - completedEpisode, 0);
  const firstName = getFirstName(userName);

  const remainingMessage = useMemo(() => {
    if (remainingDots === 0) {
      return "You finished every Dot in this Circle. Your badge is complete.";
    }
    if (remainingDots === 1) {
      return "You are 1 dot away from completing your Badge!";
    }
    return `You are ${remainingDots} dots away from completing your Badge!`;
  }, [remainingDots]);

  return (
    <div className="h-full min-h-0 bg-white px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-6 text-[#020617] md:px-7 md:pb-24 md:pt-6 lg:px-10">
      <div className="flex h-full min-h-0 w-full flex-col">
        <section className="flex h-full min-h-0 flex-1 flex-col py-2 md:h-full md:min-h-0 md:grid md:grid-cols-[minmax(0,0.66fr)_minmax(0,0.34fr)] md:grid-rows-[auto_minmax(0,1fr)_auto] md:items-start md:gap-x-8 md:gap-y-5 lg:gap-x-12 lg:gap-y-8">
          <div className="flex flex-col md:col-start-1 md:row-start-1 md:w-full md:max-w-[42rem]">
            <div>
              <div className="flex items-center gap-3 md:gap-4">
                <CircleDotsSymbol
                  totalDots={Math.max(totalDots, 1)}
                  completedDots={completedEpisode}
                  currentDot={completedEpisode}
                  label={completedEpisode}
                  size={52}
                  ringColor="#0a1024"
                  inactiveDotFill="#0a1024"
                  inactiveDotStroke="#0a1024"
                  completedDotFill="#FAC304"
                  completedDotStroke="#FAC304"
                  labelColor="#0a1024"
                  className="md:h-[64px] md:w-[64px]"
                />
                <p className="font-display text-2xl font-bold leading-[1.02] tracking-[-0.03em] text-[#020617] md:text-3xl lg:text-3xl">
                  {`Dot ${completedEpisode} completed`}
                </p>
              </div>

              <div className="mt-6 md:mt-5 lg:mt-8">
                <h1 className="font-display text-4xl font-bold leading-[0.94] tracking-[-0.05em] text-[#020617] md:max-w-[11ch] md:text-5xl md:leading-[0.88] lg:text-5xl">
                  {`You completed a Dot, ${firstName}!`}
                </h1>
                <p className="mt-3 max-w-[20ch] text-xl leading-8 text-[#020617]/82 md:max-w-[22ch] md:text-2xl md:leading-[2.05rem] lg:max-w-[20ch] lg:text-2xl lg:leading-[2.5rem]">
                  {remainingMessage}
                  <span className="ml-1 text-brand-primary">✦</span>
                </p>
              </div>

              <div className="relative mt-0 flex flex-1 min-h-0 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(250,195,4,0.14),rgba(250,195,4,0)_46%)] px-2 py-2 md:hidden">
                {burstPositions.map((position, index) => (
                  <div key={`mobile-decor-${index}`}>
                    {index < 2 ? <FireworkBurst className={position} /> : null}
                    <div
                      className={`absolute h-3 w-2 rounded-[3px] rotate-[18deg] ${position} ${confettiPalette[index % confettiPalette.length]}`}
                      aria-hidden="true"
                    />
                  </div>
                ))}

                {sparklePositions.map((position, index) => (
                  <Sparkle
                    key={`mobile-sparkle-${index}`}
                    className={position}
                  />
                ))}

                <div className="absolute inset-x-[8%] bottom-[12%] h-16 rounded-full bg-[radial-gradient(circle,rgba(2,6,23,0.12),rgba(2,6,23,0)_72%)] blur-xl" />

                <img
                  src={tomoCelebrating}
                  alt="Tomo celebrating"
                  className="relative z-10 mx-auto block h-auto max-h-full w-auto max-w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="relative mt-8 hidden items-center justify-center overflow-hidden md:col-[1/3] md:row-start-2 md:mt-0 md:flex md:h-full md:min-h-0 md:w-full md:px-4 md:py-2 lg:py-4">
            {burstPositions.map((position, index) => (
              <div key={`decor-${index}`}>
                {index < 2 ? <FireworkBurst className={position} /> : null}
                <div
                  className={`absolute h-3 w-2 rounded-[3px] rotate-[18deg] ${position} ${confettiPalette[index % confettiPalette.length]} md:h-4 md:w-2.5`}
                  aria-hidden="true"
                />
              </div>
            ))}

            {sparklePositions.map((position, index) => (
              <Sparkle key={`sparkle-${index}`} className={position} />
            ))}

            <div className="absolute inset-x-[8%] bottom-[12%] h-16 rounded-full bg-[radial-gradient(circle,rgba(2,6,23,0.12),rgba(2,6,23,0)_72%)] blur-xl md:inset-x-[16%] md:bottom-[10%] md:h-20" />

            <img
              src={tomoCelebrating}
              alt="Tomo celebrating"
              className="relative z-10 mx-auto block h-auto max-h-full w-auto max-w-full object-contain md:max-h-[100%] lg:max-h-[100%]"
            />
          </div>

          <div className="mt-0 shrink-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:col-start-1 md:row-start-3 md:mt-0 md:w-full md:max-w-[42rem] md:pb-0">
            <div className="flex items-center gap-3 md:gap-4">
              <CircleDotsSymbol
                totalDots={Math.max(totalDots, 1)}
                completedDots={completedEpisode}
                currentDot={nextEpisode}
                label={nextEpisode ?? completedEpisode}
                size={52}
                ringColor="#0a1024"
                inactiveDotFill="#0a1024"
                inactiveDotStroke="#0a1024"
                completedDotFill="#FAC304"
                completedDotStroke="#FAC304"
                labelColor="#0a1024"
                className="md:h-[64px] md:w-[64px]"
              />
              <p className="text-2xl leading-[1.2] text-[#020617] md:max-w-[18ch] md:text-2xl lg:max-w-[16ch] lg:text-3xl">
                {nextEpisode ? (
                  <>
                    Come back tomorrow for{" "}
                    <span className="font-bold">{`Dot ${nextEpisode}`}</span>
                  </>
                ) : (
                  <span className="font-bold">Circle completed</span>
                )}
              </p>
            </div>

            <div className="mt-5 hidden md:block md:mt-5 lg:mt-10">
              <button
                type="button"
                onClick={() =>
                  nextEpisode
                    ? onPreviewNextDot(book, nextEpisode)
                    : onPreviewNextDot(book, completedEpisode)
                }
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#fdba3e] px-6 py-3 text-lg font-bold text-[#020617] shadow-inset-highlight transition hover:brightness-[1.03] active:scale-[0.97] md:min-h-[58px] md:max-w-[22rem] md:text-lg lg:min-h-[64px] lg:max-w-[24rem] lg:text-xl"
              >
                {nextEpisode
                  ? `Take a peek at Dot ${nextEpisode}`
                  : "See your Circle"}
              </button>
            </div>
          </div>
        </section>
      </div>
      <div className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 md:hidden">
        <button
          type="button"
          onClick={() =>
            nextEpisode
              ? onPreviewNextDot(book, nextEpisode)
              : onPreviewNextDot(book, completedEpisode)
          }
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#fdba3e] px-6 py-3 text-lg font-bold text-[#020617] shadow-inset-highlight transition hover:brightness-[1.03] active:scale-[0.97]"
        >
          {nextEpisode
            ? `Take a peek at Dot ${nextEpisode}`
            : "See your Circle"}
        </button>
      </div>
    </div>
  );
};

export default DotCompletionPage;
