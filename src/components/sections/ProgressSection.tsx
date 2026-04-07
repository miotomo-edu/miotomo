import React, { ReactNode, useMemo, useState } from "react";
import { StarIcon } from "../common/icons/StarIcon";
import { useProgress } from "../../hooks/useProgress";
import { useAnalytics } from "../../hooks/useAnalytics";
import bookSquareIcon from "../../assets/img/progress/book-square.svg";
import connectionIcon from "../../assets/img/progress/connection.svg";

// ---------------- Types ----------------
type SkillItem = {
  emoji: string;
  text: string;
  score?: "Excellent" | "Good" | "Improving";
};

type ProgressItem = {
  label: string;
  value: number; // percentage
  trend?: string;
};

type TodayData = {
  superpower: {
    title: string;
    subtitle: string;
    new?: boolean;
    skills: SkillItem[];
  };
  progress: ProgressItem[];
  newSkills: { emoji: string; word: string; meaning: string }[];
};

type Subskill = {
  icon: string;
  title: string;
  progress: number;
  stars: number;
};

type WeekCategory = {
  name: string;
  icon: string;
  badge: "gold" | "silver" | "bronze";
  subskills: Subskill[];
};

type WeekData = {
  streak: number;
  categories: WeekCategory[];
};

// ---------------- Component ----------------
interface CardSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: ReactNode;
  contentClassName?: string;
  titleClassName?: string;
}

const CardSection: React.FC<CardSectionProps> = ({
  title,
  icon,
  children,
  contentClassName = "rounded-[28px] border border-black/10 bg-[#f6efe5] p-5 shadow-card",
  titleClassName = "text-[#161414]",
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <span
        className="inline-block h-6 w-1.5 shrink-0 rounded-full bg-brand-primary"
        aria-hidden="true"
      />
      {icon}
      <h2 className={`font-display text-xl font-bold ${titleClassName}`}>
        {title}
      </h2>
    </div>
    <div className={contentClassName}>{children}</div>
  </div>
);

const iconMap = [bookSquareIcon, connectionIcon];

// -------- Skeleton --------
const Shimmer: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-black/[0.07] ${className}`} />
);

const SkeletonCardSection: React.FC<{ rows?: number }> = ({ rows = 2 }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <span className="inline-block h-5 w-1.5 shrink-0 rounded-full bg-black/[0.07]" />
      <Shimmer className="h-5 w-36" />
    </div>
    <div className="space-y-3 rounded-[28px] border border-black/10 bg-[#f6efe5] p-5 shadow-card">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Shimmer className="h-4 w-2/3" />
          <Shimmer className="h-4 w-12" />
        </div>
      ))}
    </div>
  </div>
);

const ProgressSkeleton: React.FC = () => (
  <section className="relative min-h-screen overflow-hidden bg-white px-4 pb-24 pt-6">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(250,195,4,0.18),rgba(250,195,4,0)_65%)]" />
    <div className="relative">
      <Shimmer className="mb-2 h-4 w-28" />
      <Shimmer className="mb-6 h-11 w-52" />
      <div className="mb-5 flex gap-2">
        <Shimmer className="h-9 w-24 rounded-full" />
        <Shimmer className="h-9 w-16 rounded-full" />
        <Shimmer className="h-9 w-12 rounded-full" />
      </div>
      <div className="mb-6 flex gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Shimmer key={i} className="h-11 w-11 rounded-full" />
        ))}
      </div>
      <div className="space-y-6">
        <SkeletonCardSection rows={2} />
        <SkeletonCardSection rows={3} />
        <SkeletonCardSection rows={2} />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-block h-5 w-1.5 shrink-0 rounded-full bg-black/[0.07]" />
            <Shimmer className="h-5 w-28" />
          </div>
          <div className="rounded-[28px] bg-[#151316] p-5 shadow-hero">
            <div className="flex items-center gap-3">
              <Shimmer className="h-12 w-12 rounded-2xl bg-white/10" />
              <div className="space-y-1.5">
                <Shimmer className="h-4 w-20 bg-white/10" />
                <Shimmer className="h-3 w-32 bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
const weekLetters = ["M", "T", "W", "T", "F", "S", "S"];

const getPossessiveName = (value?: string) => {
  const firstName = value?.trim().split(/\s+/)[0] ?? "";
  if (!firstName) return "Your";
  if (firstName.toLowerCase().endsWith("s")) return `${firstName}'`;
  return `${firstName}'s`;
};

const getWordMonogram = (value: string) =>
  value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const getSubskillTone = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("vocabulary")) {
    return {
      label: "VO",
      classes: "bg-[#fff5d1] text-[#8a5d00] ring-1 ring-[#f2d47c]",
    };
  }
  if (normalized.includes("fluency")) {
    return {
      label: "FL",
      classes: "bg-[#ece6ff] text-[#5f3fa8] ring-1 ring-[#cdb8ff]",
    };
  }
  if (normalized.includes("critical")) {
    return {
      label: "CT",
      classes: "bg-[#dff2eb] text-[#255a46] ring-1 ring-[#b8decf]",
    };
  }
  if (normalized.includes("story")) {
    return {
      label: "ST",
      classes: "bg-[#ffe7d7] text-[#8b4e18] ring-1 ring-[#f3c7a4]",
    };
  }
  return {
    label: "LG",
    classes: "bg-[#f2ece7] text-[#5f5449] ring-1 ring-black/10",
  };
};

const getCategoryTone = (name: string) => {
  if (name === "Cognitive Skills") {
    return {
      shell: "bg-[#f3eee7]",
      body: "bg-white",
      chip: "bg-[#15201b] text-[#f7f1e8]",
      meter: "bg-[#d6ebe1]",
    };
  }
  if (name === "Language & Communication") {
    return {
      shell: "bg-[#f6efe5]",
      body: "bg-white",
      chip: "bg-[#20181a] text-[#f7f1e8]",
      meter: "bg-[#efe2ff]",
    };
  }
  return {
    shell: "bg-[#f8f1e4]",
    body: "bg-white",
    chip: "bg-[#221d14] text-[#f7f1e8]",
    meter: "bg-[#ffe8c7]",
  };
};

const ProgressSection: React.FC<{ conversationId: string; userName?: string }> = ({
  conversationId,
  userName = "",
}) => {
  const [view, setView] = useState<"week" | "month" | "year">("week");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, loading, error, status } = useProgress(conversationId);
  const { isAnalyzing } = useAnalytics();

  const conversationDayLabel = useMemo(() => {
    const dayString = data?.metrics?.created_at || data?.utterances?.created_at;
    if (!dayString) {
      return "Today's";
    }

    const conversationDate = new Date(dayString);
    const now = new Date();
    conversationDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffMs = now.getTime() - conversationDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today's";
    if (diffDays === 1) return "Yesterday's";

    const formatter = new Intl.DateTimeFormat(undefined, { weekday: "long" });
    const weekday = formatter.format(conversationDate);
    return `Last ${weekday}'s`;
  }, [data?.metrics?.created_at, data?.utterances?.created_at]);

  if (error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  const isProcessing =
    loading ||
    isAnalyzing ||
    (status &&
      ((status.metrics && status.metrics !== "done") ||
        (status.utterances && status.utterances !== "done")));

  if (isProcessing || !data) {
    return <ProgressSkeleton />;
  }

  const { today, week } = mapMetricsToProgress(data.metrics, data.utterances);
  const progressTitle = `${getPossessiveName(userName)} progress`;

  const categoryIcon = (name: string) => {
    if (name === "Cognitive Skills") return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.5 0-2.8.8-3.5 2a4 4 0 0 0-4 4c0 2.2 1.8 4 4 4h7a3 3 0 0 0 0-6 3 3 0 0 0-3-4z" />
        <path strokeLinecap="round" d="M10 13v4M8 17h4" />
      </svg>
    );
    if (name === "Language & Communication") return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6l-4 3V5z" />
      </svg>
    );
    if (name === "Creative & Reflective") return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 2l1.8 3.6L16 6.5l-3 2.9.7 4.1L10 11.4l-3.7 2.1.7-4.1L4 6.5l4.2-.9L10 2z" />
      </svg>
    );
    return null;
  };

  // -------- Render --------
  return (
    <section className="relative min-h-screen overflow-hidden bg-white px-4 pb-24 pt-6 text-[#161414]">
      <div className="pointer-events-none absolute inset-x-[-15%] top-[-4rem] h-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(250,195,4,0.22),rgba(250,195,4,0)_72%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-24 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,236,223,0.9),rgba(244,236,223,0)_70%)]" />
      <div className="relative">
        <div className="mb-6 rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,235,0.92))] px-5 py-5 shadow-card">
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <h1 className="font-display text-4xl font-bold leading-none text-[#171411]">
                {progressTitle}
              </h1>
              <div className="mt-3 flex items-start justify-between gap-4">
                <p className="max-w-[24rem] flex-1 text-sm leading-relaxed text-[#6f6256]">
                  Stronger story connections, richer vocabulary, and more
                  confident answers are showing up in the latest sessions.
                </p>
                <div className="w-fit shrink-0 rounded-[20px] bg-[#171411] px-3.5 py-2.5 text-right text-[#f7f1e8] shadow-elevated">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#f0d59d]">
                    active streak
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold leading-none text-brand-primary">
                    {week?.streak ?? 0}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#d8cdbd]">
                    sessions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="inline-flex w-fit rounded-full border border-black/10 bg-[#f7f2ea] p-1 shadow-xs">
            {(["week", "month", "year"] as const).map((v) => {
              const isActive = view === v;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition duration-200 ${
                    isActive
                      ? "bg-[#171411] text-[#f7f1e8] shadow-sm"
                      : "text-[#7b7264] hover:text-[#171411]"
                  }`}
                >
                  {v === "week" ? "This Week" : v}
                </button>
              );
            })}
          </div>

          <div className="flex flex-nowrap items-center justify-between gap-1.5 sm:gap-2">
            {weekLetters.map((letter, index) => {
              const todayIndex = new Date().getDay();
              const mappedIndex = (index + 1) % 7;
              const isToday = mappedIndex === todayIndex;
              return (
                <span
                  key={`${letter}-${index}`}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ring-1 sm:h-11 sm:w-11 sm:text-sm ${
                    isToday
                      ? "bg-brand-primary text-[#171411] ring-brand-primary"
                      : "bg-[#f7f2ea] text-[#8b7d70] ring-black/10"
                  }`}
                >
                  {letter}
                </span>
              );
            })}
          </div>
        </div>

        {view === "week" && (
          <div className="space-y-6">
            {today && (
              <>
                <CardSection
                  title="Session Highlights"
                  contentClassName="space-y-4 rounded-[30px] bg-[#161316] p-5 text-[#f7f1e8] shadow-hero"
                  titleClassName="text-[#161414]"
                >
                  <div className="space-y-3">
                    {today.superpower.skills.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/8 px-4 py-3 shadow-sm backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-5">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary shadow-glow-gold">
                            <img
                              src={iconMap[i] ?? bookSquareIcon}
                              alt=""
                              className="h-6 w-6"
                            />
                          </span>
                          <span className="text-sm font-medium text-[#f7f1e8]">
                            {s.text}
                          </span>
                        </div>
                        {s.score && (
                          <span className="rounded-full border border-[#f0d59d]/30 bg-[#f0d59d]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#f0d59d]">
                            {s.score}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardSection>

                <CardSection title="Learning Growth">
                  <div className="space-y-4">
                    {today.progress.map((p, i) => (
                      <div
                        key={i}
                        className="rounded-[24px] border border-black/8 bg-white px-4 py-4 shadow-xs"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-[#352e28]">
                            {p.label}
                          </span>
                          <span className="rounded-full bg-[#fff2ca] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#8b6500]">
                            {p.value}%
                          </span>
                        </div>
                        <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-[#efe3d2]">
                          <div
                            className="h-2.5 rounded-full bg-[linear-gradient(90deg,#FAC304,#F2D47C)]"
                            style={{ width: `${p.value}%` }}
                          />
                        </div>
                        {p.trend && (
                          <div className="text-xs leading-relaxed text-[#7b7264]">
                            {p.trend}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardSection>

                {today.newSkills.length > 0 && (
                  <CardSection title="New Skills Unlocked">
                    <div className="grid gap-3">
                      {today.newSkills.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-[24px] border border-[#f0ddba] bg-[linear-gradient(180deg,#fffaf0,#f9f0de)] px-4 py-4 shadow-xs"
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#171411] font-display text-sm font-bold text-[#f7f1e8] shadow-sm">
                            {getWordMonogram(s.word)}
                          </span>
                          <span className="text-sm leading-relaxed text-[#352e28]">
                            <strong className="font-semibold text-[#171411]">
                              {s.word}
                            </strong>{" "}
                            – {s.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardSection>
                )}

                <CardSection title="Area of Growth">
                  <ol className="space-y-3 text-sm text-[#352e28]">
                    {[
                      "Give longer answers to a question",
                      "Use new learnt words in sentences",
                      "Think more about characters journey",
                    ].map((text, index) => (
                      <li
                        key={text}
                        className="flex items-start gap-3 rounded-[22px] border border-black/8 bg-white px-4 py-3 shadow-xs"
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-[#171411]">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ol>
                </CardSection>
              </>
            )}

            {week && (
              <>
                <CardSection
                  title="Weekly Streak"
                  contentClassName="rounded-[30px] bg-[linear-gradient(135deg,#161316_0%,#2a241f_52%,#3b3227_100%)] p-5 text-white shadow-hero"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#fff2ca] font-display text-3xl font-bold text-[#171411] shadow-elevated">
                        {week.streak}
                      </span>
                      <div>
                        <div className="text-sm font-bold uppercase tracking-widest text-[#f0d59d]">
                          Day Streak
                        </div>
                        <div className="text-sm text-white/70">
                          Amazing work this week.
                        </div>
                      </div>
                    </div>
                    <StarIcon
                      className="h-7 w-7 text-brand-primary"
                      aria-hidden="true"
                    />
                  </div>
                </CardSection>

                {week.categories.map((cat, i) => {
                  const isOpen = expanded === cat.name;
                  const tone = getCategoryTone(cat.name);
                  return (
                    <CardSection
                      key={i}
                      title={cat.name}
                      icon={categoryIcon(cat.name)}
                      contentClassName={`overflow-hidden rounded-[28px] border border-black/10 ${tone.shell} shadow-card`}
                    >
                      <button
                        type="button"
                        className={`flex w-full cursor-pointer items-center justify-between ${tone.body} px-4 py-4 transition duration-200 hover:brightness-[0.99]`}
                        onClick={() =>
                          setExpanded(isOpen ? null : (cat.name as string))
                        }
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${tone.chip}`}
                          >
                            {cat.badge}
                          </span>
                          <span className="text-sm font-semibold text-[#2f2b27]">
                            {isOpen ? "Hide progress" : "View progress"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#7b7264]">
                            {cat.subskills.length} skills
                          </span>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            className={`h-4 w-4 text-[#7b7264] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            fill="none"
                          >
                            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="space-y-3 border-t border-black/[0.06] bg-transparent px-4 pb-4 pt-3">
                          {cat.subskills.map((s, j) => (
                            <div
                              key={j}
                              className={`flex items-center justify-between rounded-[24px] ${tone.body} px-4 py-3 shadow-xs ring-1 ring-black/[0.06]`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-[11px] font-bold uppercase tracking-widest ${getSubskillTone(s.title).classes}`}
                                >
                                  {getSubskillTone(s.title).label}
                                </span>
                                <span className="text-sm font-semibold text-[#2f2b27]">
                                  {s.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className={`h-2.5 w-24 overflow-hidden rounded-full ${tone.meter}`}>
                                  <div
                                    className="h-2.5 rounded-full bg-[linear-gradient(90deg,#FAC304,#F2D47C)]"
                                    style={{ width: `${s.progress}%` }}
                                  />
                                </div>
                                <span className="min-w-10 text-right text-xs font-semibold text-[#6f6256]">
                                  {s.progress}%
                                </span>
                                <span className="flex items-center gap-0.5">
                                  {Array.from({ length: s.stars }).map((_, k) => (
                                    <StarIcon key={k} className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                                  ))}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardSection>
                  );
                })}
              </>
            )}
          </div>
        )}
        {view === "month" && (
          <div className="space-y-6">
            <CardSection title="Monthly Summary">
              <div className="rounded-[24px] border border-black/8 bg-white px-4 py-4 shadow-xs">
                <p className="text-sm leading-relaxed text-[#6f6256]">
                  Monthly insights will appear here soon.
                </p>
              </div>
            </CardSection>
          </div>
        )}

        {view === "year" && (
          <div className="space-y-6">
            <CardSection title="Yearly Summary">
              <div className="rounded-[24px] border border-black/8 bg-white px-4 py-4 shadow-xs">
                <p className="text-sm leading-relaxed text-[#6f6256]">
                  Yearly insights will appear here soon.
                </p>
              </div>
            </CardSection>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProgressSection;

// ---------------- Mapper ----------------
function mapMetricsToProgress(metrics: any, utterances: any) {
  const pct = (v?: number) => (v && v > 0 ? Math.round(v * 100) : 0);

  const today: TodayData = {
    superpower: {
      subtitle: "Highlights from your answers",
      new: true,
      skills: []
        .concat(
          metrics.reading_comprehension?.score > 0
            ? {
                emoji: "📖",
                text: "Asked deep questions about character motivations",
              }
            : [],
          metrics.critical_thinking?.score > 0
            ? {
                emoji: "🔗",
                text: "Connected story to real-life experiences",
              }
            : [],
        )
        .filter(Boolean),
    },
    progress: []
      .concat(
        metrics.reading_comprehension?.score > 0
          ? {
              label: "Reading Comprehension",
              value: pct(metrics.reading_comprehension.score),
              trend: metrics.reading_comprehension.explanation,
            }
          : [],
        metrics.logical_reasoning?.score > 0
          ? {
              label: "Logical Reasoning",
              value: pct(metrics.logical_reasoning.score),
              trend: metrics.logical_reasoning.explanation,
            }
          : [],
        metrics.critical_thinking?.score > 0
          ? {
              label: "Critical Thinking",
              value: pct(metrics.critical_thinking.score),
              trend: metrics.critical_thinking.explanation,
            }
          : [],
        metrics.vocabulary?.score > 0
          ? {
              label: "Vocabulary",
              value: pct(metrics.vocabulary.score),
              trend: metrics.vocabulary.explanation,
            }
          : [],
      )
      .filter(Boolean),
    newSkills:
      metrics.advanced_vocabulary?.score > 0 &&
      Array.isArray(metrics.advanced_vocabulary.example)
        ? metrics.advanced_vocabulary.example.map((w: string) => ({
            emoji: "✨",
            word: w,
            meaning: "Learned word",
          }))
        : [],
  };

  const week: WeekData = {
    streak: utterances?.utterance_count || 0,
    categories: [
      {
        name: "Cognitive Skills",
        icon: "🧠",
        badge: "gold",
        subskills: []
          .concat(
            metrics.logical_reasoning?.score > 0
              ? {
                  icon: "🎯",
                  title: "Logical reasoning",
                  progress: pct(metrics.logical_reasoning.score),
                  stars: 3,
                }
              : [],
            metrics.critical_thinking?.score > 0
              ? {
                  icon: "🤔",
                  title: "Critical thinking",
                  progress: pct(metrics.critical_thinking.score),
                  stars: 2,
                }
              : [],
          )
          .filter(Boolean),
      },
      {
        name: "Language & Communication",
        icon: "💬",
        badge: "silver",
        subskills: []
          .concat(
            metrics.vocabulary?.score > 0
              ? {
                  icon: "📚",
                  title: "Vocabulary",
                  progress: pct(metrics.vocabulary.score),
                  stars: 2,
                }
              : [],
            metrics.fluency?.score > 0
              ? {
                  icon: "🎤",
                  title: "Fluency",
                  progress: pct(metrics.fluency.score),
                  stars: 2,
                }
              : [],
          )
          .filter(Boolean),
      },
      {
        name: "Creative & Reflective",
        icon: "🎨",
        badge: "silver",
        subskills: []
          .concat(
            metrics.storytelling?.score > 0
              ? {
                  icon: "✨",
                  title: "Storytelling",
                  progress: pct(metrics.storytelling.score),
                  stars: 2,
                }
              : [],
          )
          .filter(Boolean),
      },
    ],
  };

  return { today, week };
}
