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
  children: ReactNode;
  contentClassName?: string;
}

const CardSection: React.FC<CardSectionProps> = ({
  title,
  children,
  contentClassName = "rounded-2xl bg-white ring-1 ring-black/10 p-4",
}) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-2.5">
      <span className="inline-block h-5 w-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden="true" />
      <h2 className="font-display text-lg font-bold text-gray-900">{title}</h2>
    </div>
    <div className={contentClassName}>{children}</div>
  </div>
);

const iconMap = [bookSquareIcon, connectionIcon];
const weekLetters = ["M", "T", "W", "T", "F", "S", "S"];

const ProgressSection: React.FC<{ conversationId: string }> = ({
  conversationId,
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

  if (isProcessing) {
    return <div className="p-6">Processing conversation…</div>;
  }
  if (!data) {
    return <div className="p-6">No progress available</div>;
  }

  const { today, week } = mapMetricsToProgress(data.metrics, data.utterances);

  // -------- Render --------
  return (
    <section className="min-h-screen bg-[#efe6da] px-4 pb-24 pt-6">
      <h1 className="font-display mb-5 text-3xl font-bold text-gray-900">Progress</h1>
      {/* Pills */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView("week")}
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition ${
              view === "week"
                ? "bg-brand-primary text-black"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            This Week
          </button>
        </div>
        <div className="flex gap-2">
          {["month", "year"].map((v) => {
            const isActive = view === v;
            return (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition ${
                  isActive
                    ? "bg-brand-primary text-black"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {view === "week" && (
        <>
          <div className="mb-4 flex gap-3 font-bold">
            {weekLetters.map((letter, index) => {
              const todayIndex = new Date().getDay();
              const mappedIndex = (index + 1) % 7;
              const isToday = mappedIndex === todayIndex;
              return (
                <span
                  key={`${letter}-${index}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    isToday
                      ? "bg-brand-primary text-black shadow-[0_2px_8px_rgba(250,195,4,0.35)]"
                      : "bg-white/60 text-gray-500 ring-1 ring-black/[0.08]"
                  }`}
                >
                  {letter}
                </span>
              );
            })}
          </div>
          <div className="space-y-6">
            {today && (
              <>
                <CardSection
                  title={`${conversationDayLabel} Superpower`}
                  contentClassName="space-y-3 p-0"
                >
                  <div className="space-y-3">
                    {today.superpower.skills.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 ring-1 ring-black/[0.08]"
                      >
                        <div className="flex items-center gap-5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary">
                            <img
                              src={iconMap[i] ?? bookSquareIcon}
                              alt=""
                              className="h-6 w-6"
                            />
                          </span>
                          <span className="text-sm text-gray-800">
                            {s.text}
                          </span>
                        </div>
                        {s.score && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#b07b00]">
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
                      <div key={i}>
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm text-gray-700">
                            {p.label}
                          </span>
                          <span className="text-sm font-semibold text-[#b07b00]">
                            {p.value}%
                          </span>
                        </div>
                        <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-black/[0.08]">
                          <div
                            className="h-2 rounded-full bg-brand-primary"
                            style={{ width: `${p.value}%` }}
                          />
                        </div>
                        {p.trend && (
                          <div className="text-xs text-black/50">{p.trend}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardSection>

                {today.newSkills.length > 0 && (
                  <CardSection title="New Skills Unlocked">
                    <div className="space-y-3">
                      {today.newSkills.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-3xl bg-white px-4 py-3 ring-1 ring-black/[0.08]"
                        >
                          <span>{s.emoji}</span>
                          <span className="text-sm">
                            <strong>{s.word}</strong> – {s.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardSection>
                )}

                <CardSection title="Area of Growth">
                  <ol className="space-y-3 text-sm text-gray-800">
                    {[
                      "Give longer answers to a question",
                      "Use new learnt words in sentences",
                      "Think more about characters journey",
                    ].map((text, index) => (
                      <li key={text} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-black">
                          {index + 1}
                        </span>
                        <span>{text}</span>
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
                  contentClassName="rounded-2xl bg-[linear-gradient(135deg,#1a1a1a_0%,#2d2a1f_100%)] p-4 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-4xl font-bold text-brand-primary">{week.streak}</span>
                      <div>
                        <div className="text-sm font-bold text-white">Day Streak</div>
                        <div className="text-xs text-white/60">Amazing work this week!</div>
                      </div>
                    </div>
                    <StarIcon className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                  </div>
                </CardSection>

                {week.categories.map((cat, i) => {
                  const isOpen = expanded === cat.name;
                  return (
                    <CardSection
                      key={i}
                      title={cat.name}
                      contentClassName="overflow-hidden rounded-2xl ring-1 ring-black/10"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between bg-white px-4 py-3"
                        onClick={() =>
                          setExpanded(isOpen ? null : (cat.name as string))
                        }
                      >
                        <span className="text-sm font-semibold text-gray-700">
                          {isOpen ? "Hide progress" : "View progress"}
                        </span>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                        >
                          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="space-y-2 border-t border-black/[0.06] bg-white px-4 pb-4 pt-3">
                          {cat.subskills.map((s, j) => (
                            <div
                              key={j}
                              className="flex items-center justify-between rounded-3xl bg-white/60 px-3 py-2.5 ring-1 ring-black/[0.06]"
                            >
                              <div className="flex items-center gap-2">
                                <span>{s.icon}</span>
                                <span className="text-sm">{s.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-20 overflow-hidden rounded-full bg-black/[0.08]">
                                  <div
                                    className="h-2 rounded-full bg-brand-primary"
                                    style={{ width: `${s.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs">
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
        </>
      )}
      {view === "month" && (
        <div className="space-y-6">
          <CardSection title="Monthly Summary">
            <p className="text-sm text-gray-800">
              Monthly insights will appear here soon.
            </p>
          </CardSection>
        </div>
      )}

      {view === "year" && (
        <div className="space-y-6">
          <CardSection title="Yearly Summary">
            <p className="text-sm text-gray-800">
              Yearly insights will appear here soon.
            </p>
          </CardSection>
        </div>
      )}
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
