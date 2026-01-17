import React, { ReactNode, useMemo, useState } from "react";
import { useProgress } from "../../hooks/useProgress";
import { useAnalytics } from "../../hooks/useAnalytics";
import teacherIcon from "../../assets/img/progress/teacher.svg";
import rankingIcon from "../../assets/img/progress/ranking.svg";
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
  icon?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

const CardSection: React.FC<CardSectionProps> = ({
  title,
  icon,
  children,
  contentClassName = "rounded-xl bg-[#F8CBC4] p-4",
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-black">
      <span className="flex items-center">
        {icon ?? <img src={teacherIcon} alt="" className="h-8 w-8" />}
      </span>
      <span>{title}</span>
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

  const uppercaseLabel =
    conversationDayLabel?.toUpperCase?.() ?? conversationDayLabel;

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
    <section className="py-6 px-4 pb-24 bg-[#EAB7AF]">
      <h1 className="mb-6 text-3xl font-extrabold text-gray-900">Progress</h1>
      {/* Pills */}
      <div className="mb-4 flex items-center justify-between text-sm font-bold uppercase text-gray-900">
        <div className="flex gap-4">
          <button
            onClick={() => setView("week")}
            className={`pb-1 transition ${
              view === "week"
                ? "border-b-2 border-gray-900"
                : "border-b-2 border-transparent"
            }`}
          >
            THIS WEEK
          </button>
        </div>
        <div className="flex gap-4">
          {["month", "year"].map((v) => {
            const isActive = view === v;
            return (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`pb-1 transition ${
                  isActive
                    ? "border-b-2 border-gray-900"
                    : "border-b-2 border-transparent"
                }`}
              >
                {v.toUpperCase()}
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
                      ? "bg-[#F18C7C] text-white border border-white"
                      : "bg-white/20 text-gray-900"
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
                  title={`${uppercaseLabel} SUPERPOWER`}
                  icon={<img src={rankingIcon} alt="" className="h-8 w-8" />}
                  contentClassName="space-y-3 bg-transparent p-0"
                >
                  <div className="space-y-3">
                    {today.superpower.skills.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl bg-white/20 px-4 py-3"
                      >
                        <div className="flex items-center gap-5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F18C7C]">
                            <img
                              src={iconMap[i] ?? teacherIcon}
                              alt=""
                              className="h-6 w-6"
                            />
                          </span>
                          <span className="text-sm text-gray-800">
                            {s.text}
                          </span>
                        </div>
                        {s.score && (
                          <span className="text-green-700 text-sm font-bold">
                            {s.score}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardSection>

                <CardSection title="LEARNING GROWTH">
                  <div className="space-y-4">
                    {today.progress.map((p, i) => (
                      <div key={i}>
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm text-gray-700">
                            {p.label}
                          </span>
                          <span className="text-green-600 text-sm font-semibold">
                            {p.value}%
                          </span>
                        </div>
                        <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-white/30">
                          <div
                            className="h-2 rounded-full bg-[#F18C7C]"
                            style={{ width: `${p.value}%` }}
                          />
                        </div>
                        {p.trend && (
                          <div className="text-xs text-green-700">{p.trend}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardSection>

                {today.newSkills.length > 0 && (
                  <CardSection title="NEW SKILLS UNLOCKED">
                    <div className="space-y-3">
                      {today.newSkills.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg bg-white/60 p-2"
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

                <CardSection title="AREA OF GROWTH">
                  <ol className="space-y-3 text-sm text-gray-800">
                    {[
                      "Give longer answers to a question",
                      "Use new learnt words in sentences",
                      "Think more about characters journey",
                    ].map((text, index) => (
                      <li key={text} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/40 font-semibold text-gray-700">
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
                <CardSection title="WEEKLY STREAK">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{week.streak}</span>
                      <span className="font-semibold">Day Streak!</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      Amazing work this week! 🌟
                    </span>
                  </div>
                </CardSection>

                {week.categories.map((cat, i) => {
                  const isOpen = expanded === cat.name;
                  return (
                    <CardSection key={i} title={cat.name.toUpperCase()}>
                      <div
                        className={`rounded-xl border-2 ${
                          isOpen ? "border-gray-300" : "border-transparent"
                        }`}
                      >
                        <div
                          className="flex cursor-pointer items-center justify-between p-4"
                          onClick={() =>
                            setExpanded(isOpen ? null : (cat.name as string))
                          }
                        >
                          <span className="text-sm font-semibold text-gray-700">
                            {isOpen ? "Hide progress" : "View progress"}
                          </span>
                          <span className="text-gray-700">
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </div>
                        {isOpen && (
                          <div className="space-y-3 p-4">
                            {cat.subskills.map((s, j) => (
                              <div
                                key={j}
                                className="flex items-center justify-between rounded-lg bg-white/60 p-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{s.icon}</span>
                                  <span className="text-sm">{s.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-20 overflow-hidden rounded-full bg-white/60">
                                    <div
                                      className="h-2 bg-gradient-to-r from-blue-500 to-sky-400"
                                      style={{ width: `${s.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs">
                                    {s.progress}%
                                  </span>
                                  <span className="text-sm">
                                    {"⭐".repeat(s.stars)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
          <CardSection title="MONTHLY SUMMARY">
            <p className="text-sm text-gray-800">
              Monthly insights will appear here soon.
            </p>
          </CardSection>
        </div>
      )}

      {view === "year" && (
        <div className="space-y-6">
          <CardSection title="YEARLY SUMMARY">
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
