import React from "react";
import tomoCelebrating from "../../assets/img/tomo-celebrating-black-bg.png";

type DemoSubscriptionPageProps = {
  userName: string;
  onContinue: () => void;
};

const getFirstName = (value: string) => {
  const first = value.trim().split(/\s+/)[0];
  return first || "friend";
};

const topicTags = ["Dinosaurs", "Ancient Rome", "Light & shadow", "Oceans"];

const strengths = [
  "Made connections and linked new ideas",
  "Explained cause and effect clearly",
  "Learnt 4 new words",
];

const growthAreas = [
  "Give more detail and give more examples",
  "Use new words in context",
];

const keywordBadges = ["Predator", "Fossil", "Carnivore", "Extinct"];

const DemoSubscriptionPage: React.FC<DemoSubscriptionPageProps> = ({
  userName,
  onContinue,
}) => {
  const firstName = getFirstName(userName);

  return (
    <div className="min-h-full w-full bg-[#f4ecdf] pb-6 pt-0 text-[#020617]">
      <div className="flex min-h-full w-full flex-col gap-3 px-3 pt-3 md:gap-4 md:px-4 md:pt-4 lg:px-6">
        <section className="w-full rounded-[14px] bg-[#0f0f0e] px-4 py-4 text-white shadow-[0_16px_34px_rgba(2,6,23,0.22)] md:rounded-[16px] md:px-6 md:py-5">
          <div className="flex items-center gap-2 text-sm text-white/84">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/25 text-[11px]">
              ✦
            </span>
            <span>Dot 1 completed</span>
          </div>

          <h1 className="mt-3 font-display text-[2.05rem] font-bold leading-[0.94] tracking-[-0.03em] text-white md:max-w-[16ch] md:text-[2.4rem]">
            {`${firstName}, that was a great discussion!`}
          </h1>

          <div className="relative mt-3 overflow-hidden rounded-[12px] bg-[#0f0f0e] px-3 py-3 md:rounded-[14px] md:px-4 md:py-4">
            <img
              src={tomoCelebrating}
              alt="Tomo celebrating"
              className="mx-auto block w-full max-w-[210px] md:max-w-[300px]"
            />
          </div>

          <h2 className="mt-3 font-display text-[2rem] font-bold leading-[0.95] tracking-[-0.02em] text-[#fac304] md:text-[2.3rem]">
            Keep {firstName} learning
          </h2>
          <p className="mt-2 max-w-[66ch] text-[1rem] leading-7 text-white/82 md:text-[1.08rem]">
            Subscribe to Miotomo and unlock every circle, so {firstName} keeps
            learning, thinking, questioning, and teaching Tomo everything they
            discover.
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {topicTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-[6px] border border-white/16 bg-white/8 px-2.5 py-1 text-[12px] font-semibold text-white/86"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            <button
              type="button"
              className="flex h-[52px] w-full items-center justify-between rounded-[10px] border border-white/22 bg-transparent px-3.5 text-left md:h-[56px]"
            >
              <span className="text-lg font-bold text-white">Annual</span>
              <span className="rounded-full bg-[#fac304] px-2 py-0.5 text-[11px] font-bold uppercase text-[#020617]">
                Best Value
              </span>
              <span className="text-lg font-bold text-white">INR 900/mo</span>
            </button>

            <button
              type="button"
              className="flex h-[52px] w-full items-center justify-between rounded-[10px] border border-white/22 bg-transparent px-3.5 text-left md:h-[56px]"
            >
              <span className="text-lg font-bold text-white">Monthly</span>
              <span className="text-lg font-bold text-white">INR 1200/mo</span>
            </button>
          </div>

          <button
            type="button"
            className="mt-3 inline-flex h-[52px] w-full items-center justify-center rounded-[8px] bg-white text-[1.05rem] font-bold text-[#020617] md:mt-4 md:h-[56px]"
          >
            Subscribe to Miotomo
          </button>
        </section>

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <section className="rounded-[14px] bg-[#e4e4e4] px-4 py-3 text-[#020617] md:h-full md:rounded-[16px] md:px-5 md:py-4">
            <h3 className="text-base font-extrabold uppercase tracking-[0.02em]">
              What {firstName.toUpperCase()} did well
            </h3>
            <ul className="mt-2 space-y-2.5">
              {strengths.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[1rem] font-semibold"
                >
                  <span className="mt-0.5 text-[1.05rem] text-[#6b7280]">
                    ✦
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {keywordBadges.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-[6px] bg-[#fac304] px-2 py-0.5 text-[12px] font-bold text-[#5e4300]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-[14px] bg-[#e4e4e4] px-4 py-3 text-[#020617] md:h-full md:rounded-[16px] md:px-5 md:py-4">
            <h3 className="text-base font-extrabold uppercase tracking-[0.02em]">
              Room to grow
            </h3>
            <ul className="mt-2 space-y-2.5">
              {growthAreas.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[1rem] font-semibold"
                >
                  <span className="mt-0.5 text-[1.05rem] text-[#6b7280]">
                    ◎
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-1 inline-flex h-[52px] w-full items-center justify-center rounded-[10px] bg-[#020617] text-[1.05rem] font-bold text-white shadow-[0_10px_24px_rgba(2,6,23,0.16)] md:h-[56px]"
        >
          Subscribe to Miotomo
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex w-full items-center justify-center text-sm font-semibold text-[#020617]/58 underline-offset-4 transition hover:text-[#020617]"
        >
          Remind me later
        </button>
      </div>
    </div>
  );
};

export default DemoSubscriptionPage;
