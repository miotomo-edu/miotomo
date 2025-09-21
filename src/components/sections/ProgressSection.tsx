import React, { useState } from "react";
import { useProgress } from "../../hooks/useProgress";

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

interface ProgressSectionProps {
  conversationId?: string;
  userName?: string;
  studentId?: string;
  selectedBook?: {
    id: string;
    title?: string;
    author?: string;
    cover?: string;
  };
}

// ---------------- Component ----------------
const ProgressSection: React.FC<ProgressSectionProps> = ({
  conversationId,
  userName,
  studentId,
  selectedBook,
}) => {
  const [view, setView] = useState<"today" | "week" | "month">("today");
  const [expanded, setExpanded] = useState<string | null>(null);

  const shouldFetchProgress = conversationId || studentId;
  const { data, loading, error } = useProgress(
    conversationId || "",
    studentId || "",
    selectedBook?.id ?? null,
  );

  if (shouldFetchProgress && loading) {
    return <div className="p-6">Loading progress…</div>;
  }
  if (shouldFetchProgress && error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  if (!shouldFetchProgress) {
    return (
      <section className="py-6 px-4 pb-24">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-gray-500 mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Progress Tracking
          </h3>
          <p className="text-gray-500 text-sm">
            Start a conversation to see your learning progress here!
          </p>
          {userName && (
            <p className="text-gray-400 text-xs mt-2">
              Hi {userName}! Your progress will appear once you begin reading.
            </p>
          )}
        </div>
      </section>
    );
  }

  if (!data) {
    return <div className="p-6">No progress available</div>;
  }

  const { today, week } = mapMetricsToProgress(data.metrics, data.utterances);

  // -------- Render --------
  return (
    <section className="py-6 px-4 pb-24">
      {/* Pills */}
      <div className="flex gap-2 mb-6">
        {["today", "week", "month"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as any)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              view === v
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {v[0].toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* TODAY VIEW */}
      {view === "today" && today && (
        <div className="space-y-6">
          {/* Superpower */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-400">
                  ⭐
                </div>
                <div>
                  <div className="font-semibold">{today.superpower.title}</div>
                  <div className="text-gray-500 text-sm">
                    {today.superpower.subtitle}
                  </div>
                </div>
              </div>
              {today.superpower.new && (
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  New!
                </span>
              )}
            </div>
            <div className="space-y-3">
              {today.superpower.skills.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
                >
                  <div className="flex items-center gap-2">
                    <span>{s.emoji}</span>
                    <span className="text-sm">{s.text}</span>
                  </div>
                  {s.score && (
                    <span className="text-green-600 text-sm font-bold">
                      {s.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-400">
                🧠
              </div>
              <div>
                <div className="font-semibold">Learning Growth</div>
                <div className="text-gray-500 text-sm">Today’s progress</div>
              </div>
            </div>
            <div className="space-y-4">
              {today.progress.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{p.label}</span>
                    <span className="text-green-600 font-semibold text-sm">
                      {p.value}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-2 bg-gradient-to-r from-green-500 to-emerald-400"
                      style={{ width: `${p.value}%` }}
                    />
                  </div>
                  {p.trend && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      📈 {p.trend}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* New Skills */}
          {today.newSkills.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-400">
                  📚
                </div>
                <div>
                  <div className="font-semibold">New Skills Unlocked</div>
                  <div className="text-gray-500 text-sm">
                    Words mastered today
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {today.newSkills.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
                  >
                    <span>{s.emoji}</span>
                    <span className="text-sm">
                      <strong>{s.word}</strong> – {s.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* WEEK VIEW */}
      {view === "week" && week && (
        <div className="space-y-6">
          {/* Streak */}
          <div className="bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-xl shadow p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="text-2xl font-bold">{week.streak}</span>
              <span className="font-semibold">Day Streak!</span>
            </div>
            <span className="text-sm">Amazing work this week! 🌟</span>
          </div>

          {/* Categories */}
          {week.categories.map((cat, i) => {
            const isOpen = expanded === cat.name;
            return (
              <div
                key={i}
                className={`bg-white rounded-xl shadow border-2 ${
                  isOpen ? "border-gray-300" : "border-transparent"
                }`}
              >
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() =>
                    setExpanded(isOpen ? null : (cat.name as string))
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-semibold">{cat.name}</span>
                  </div>
                  <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
                </div>
                {isOpen && (
                  <div className="p-4 space-y-3">
                    {cat.subskills.map((s, j) => (
                      <div
                        key={j}
                        className="flex justify-between items-center bg-gray-50 rounded-lg p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span>{s.icon}</span>
                          <span className="text-sm">{s.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-gradient-to-r from-blue-500 to-sky-400"
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>
                          <span className="text-xs">{s.progress}%</span>
                          <span className="text-sm">
                            {"⭐".repeat(s.stars)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
      title: "Today’s Superpower",
      subtitle: "Highlights from your answers",
      new: true,
      skills: []
        .concat(
          metrics.reading_comprehension?.score > 0
            ? {
                emoji: "📖",
                text: "Asked deep questions about character motivations",
                score: "Excellent",
              }
            : [],
          metrics.critical_thinking?.score > 0
            ? {
                emoji: "🔗",
                text: "Connected story to real-life experiences",
                score: "Excellent",
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
