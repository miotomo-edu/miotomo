import React, { CSSProperties, useMemo, useState } from "react";

type ProgressSectionV3Props = {
  conversationId?: string;
  userName?: string;
};

type ProgressSkill = {
  name: string;
  pct: number;
  prev?: number;
  cap: string;
};

type ProgressQuote = {
  session: string;
  text: string;
  skill: string;
};

type ProgressAdventure = {
  title: string;
  dots: number;
  done: boolean;
  doneDate?: string;
  doneDots: number;
  words: string[];
  quotes: ProgressQuote[];
};

type ProgressMonth = {
  label: string;
  adventures: ProgressAdventure[];
  growth: ProgressSkill[];
  next: string[];
};

type AdventureEpisode = {
  score: number;
  title: string;
  summary: string;
  status?: "complete" | "latest" | "next";
};

type AdventureFocus = {
  label: string;
  title: string;
  detail: string;
};

type SkillTrack = {
  name: string;
  score: number;
  total: number;
  note: string;
  accent?: "gold" | "purple" | "coral";
};

type RecentWin = {
  adventure: string;
  tag: string;
  quote: string;
};

type AllAdventureOverview = {
  totalAdventures: number;
  totalEpisodes: number;
  totalScore: number;
  scoreGain: number;
  trendLabel: string;
  summary: string;
  scores: number[];
  growthStage: number;
  growthHeadline: string;
  growthBody: string;
  biggestGrowth: {
    skill: string;
    delta: number;
    body: string;
  };
  nextFocus: {
    skill: string;
    state: string;
    body: string;
    current: number;
    target: number;
    action: string;
    prompts: string[];
  };
  mission: {
    title: string;
    steps: string[];
    cta: string;
  };
  adultNote: string;
  recentWins: RecentWin[];
};

const PROG_MONTHS: ProgressMonth[] = [
  {
    label: "June 2026",
    adventures: [
      {
        title: "Friendships",
        dots: 5,
        done: false,
        doneDots: 4,
        words: [
          "Enormous",
          "Trust",
          "Loyalty",
          "Betrayal",
          "Empathy",
          "Jealousy",
          "Forgive",
          "Honest",
          "Courage",
          "Defend",
          "Promise",
          "Argue",
        ],
        quotes: [
          {
            session: "Episode 4",
            text: "Lucius betrayed his friend because he wanted power — but I think he was also scared.",
            skill: "Critical thinking",
          },
        ],
      },
      {
        title: "Courage",
        dots: 5,
        done: false,
        doneDots: 3,
        words: ["Brave", "Afraid", "Challenge", "Bold", "Fear"],
        quotes: [
          {
            session: "Episode 3",
            text: "Courage isn't when you're not scared — it's when you do it anyway.",
            skill: "Critical thinking",
          },
        ],
      },
    ],
    growth: [
      {
        name: "Critical thinking",
        pct: 72,
        prev: 18,
        cap: "Held counter-arguments across 4 episodes.",
      },
      {
        name: "Speaking confidence",
        pct: 58,
        prev: 8,
        cap: "Average spoken turn grew from 4s to 18s.",
      },
      {
        name: "Vocabulary",
        pct: 65,
        prev: 14,
        cap: "17 new words used correctly in context.",
      },
      {
        name: "Storytelling",
        pct: 55,
        prev: 22,
        cap: "Retold events with cause and effect.",
      },
      {
        name: "Evidence",
        pct: 45,
        prev: 14,
        cap: "Started backing ideas with details from the story.",
      },
      {
        name: "Deeper thinking",
        pct: 90,
        prev: 52,
        cap: "Spotted hidden motives and emotions.",
      },
    ],
    next: [
      "Hold an argument for 3 or more turns without dropping the point",
      "Use newly learned words in a full sentence without prompting",
    ],
  },
  {
    label: "May 2026",
    adventures: [
      {
        title: "Friendships",
        dots: 5,
        done: false,
        doneDots: 3,
        words: ["Trust", "Enormous", "Loyalty", "Courage", "Defend"],
        quotes: [
          {
            session: "Episode 3",
            text: "I think Tomo should just be honest even if it hurts.",
            skill: "Storytelling",
          },
        ],
      },
    ],
    growth: [
      {
        name: "Critical thinking",
        pct: 45,
        prev: 28,
        cap: "Started holding basic arguments.",
      },
      {
        name: "Speaking confidence",
        pct: 30,
        prev: 12,
        cap: "Turn length grew from 3s to 8s.",
      },
      {
        name: "Vocabulary",
        pct: 38,
        prev: 10,
        cap: "5 new words used in context.",
      },
    ],
    next: [
      "Build confidence in retelling stories to Tomo",
      "Keep using new words in full sentences",
    ],
  },
];

const CURRENT_ADVENTURE_EPISODES: AdventureEpisode[] = [
  {
    score: 52,
    title: "Ep 1 — Sam said",
    summary: "You started by giving clear answers.",
    status: "complete",
  },
  {
    score: 61,
    title: "Ep 2 — What is true friendship?",
    summary: "You began to explain why.",
    status: "complete",
  },
  {
    score: 68,
    title: "Ep 3 — Better to tell the truth or be kind?",
    summary: "You found stronger words.",
    status: "complete",
  },
  {
    score: 72,
    title: "Ep 4 — Friendship is mixed feelings",
    summary:
      "Strong thinking — you noticed characters can want two things at once. Next: add one story detail as proof.",
    status: "latest",
  },
  {
    score: 0,
    title: "Ep 5 — Final teach-back",
    summary: "Next teach Tomo the whole idea.",
    status: "next",
  },
];

const CURRENT_ADVENTURE_FOCUS: AdventureFocus[] = [
  {
    label: "Top growth",
    title: "Giving reasons",
    detail: "Answers became fuller and more supported.",
  },
  {
    label: "Current strength",
    title: "Deeper thinking",
    detail: "Mia is spotting mixed motives and feelings.",
  },
  {
    label: "Still practicing",
    title: "Using story evidence",
    detail: "The next step is to prove ideas with details.",
  },
];

const CURRENT_ADVENTURE_SKILLS: SkillTrack[] = [
  {
    name: "Clear Answer",
    score: 12,
    total: 20,
    note: "Gave clear opinions across episodes.",
    accent: "purple",
  },
  {
    name: "Reasoning",
    score: 13,
    total: 20,
    note: "Explained why characters behaved that way.",
    accent: "purple",
  },
  {
    name: "Evidence",
    score: 9,
    total: 20,
    note: "Needs more story details to back up ideas.",
    accent: "coral",
  },
  {
    name: "Vocabulary",
    score: 11,
    total: 15,
    note: "Used new words correctly in context.",
    accent: "purple",
  },
  {
    name: "Speaking Confidence",
    score: 9,
    total: 15,
    note: "Kept talking through follow-up questions.",
    accent: "purple",
  },
  {
    name: "Deeper Thinking",
    score: 9,
    total: 10,
    note: "Noticed hidden motives and feelings.",
    accent: "gold",
  },
];

const ALL_ADVENTURES_SKILLS: SkillTrack[] = [
  {
    name: "Clear Answer",
    score: 16,
    total: 20,
    note: "You usually say your idea clearly.",
    accent: "gold",
  },
  {
    name: "Reasoning",
    score: 17,
    total: 20,
    note: "You explain why.",
    accent: "gold",
  },
  {
    name: "Evidence",
    score: 11,
    total: 20,
    note: "Next step: use story details.",
    accent: "coral",
  },
  {
    name: "Vocabulary",
    score: 12,
    total: 15,
    note: "You are starting to use precise words.",
    accent: "gold",
  },
  {
    name: "Speaking Confidence",
    score: 10,
    total: 15,
    note: "You answer follow-up questions well.",
    accent: "purple",
  },
  {
    name: "Deeper Thinking",
    score: 8,
    total: 10,
    note: "You notice hidden motives and feelings.",
    accent: "gold",
  },
];

const ALL_ADVENTURES_OVERVIEW: AllAdventureOverview = {
  totalAdventures: 6,
  totalEpisodes: 27,
  totalScore: 74,
  scoreGain: 18,
  trendLabel: "+18 marks overall",
  summary:
    "Mia, your answers are becoming clearer, longer, and more thoughtful.",
  scores: [56, 61, 65, 69, 72, 74],
  growthStage: 3,
  growthHeadline: "You are here: Strong.",
  growthBody:
    "To reach Greater Depth, prove more of your ideas with story details.",
  biggestGrowth: {
    skill: "Reasoning",
    delta: 22,
    body:
      "At the start, Mia often gave short answers. Now she explains why characters act the way they do.",
  },
  nextFocus: {
    skill: "Evidence",
    state: "Building",
    body:
      "Mia has strong ideas. To win more marks, she now needs to prove them with details from the story.",
    current: 74,
    target: 78,
    action: "Add one story detail",
    prompts: [
      '"I know this because..."',
      '"The part that proves this is..."',
      '"This shows that..."',
    ],
  },
  mission: {
    title: "Practise Evidence",
    steps: [
      "Say your idea",
      "Use because",
      "Add one story detail",
      "Explain what it shows",
    ],
    cta: "Choose Next Adventure",
  },
  adultNote:
    "Mia's reasoning and speaking confidence are improving well. Her next step is to use more evidence from the story to support her ideas. This is the bridge from Strong to Greater Depth thinking.",
  recentWins: [
    {
      adventure: "Friendship",
      tag: "Mixed motives",
      quote:
        '"Lucius wanted power — but I think he was also scared."',
    },
    {
      adventure: "Ocean Mystery",
      tag: "Empathy",
      quote:
        '"The seahorse helped because she understood how lonely the whale felt."',
    },
    {
      adventure: "Space Rescue",
      tag: "Balanced thinking",
      quote:
        '"The captain was brave, but she still needed her team."',
    },
  ],
};

const progressThemeVars: CSSProperties & Record<string, string> = {
  "--gold": "#b6c356",
  "--gold-soft": "rgba(182,195,86,0.16)",
  "--purple-soft": "#8d6ce0",
  "--coral-soft": "#d9836a",
  "--surface": "#32294A",
  "--surface-2": "#2a2440",
  "--surface-3": "#3c3356",
  "--border": "rgba(240,230,207,0.08)",
  "--font-body": '"Nunito Sans", "Nunito", "Satoshi", system-ui, sans-serif',
  "--font-display": '"Satoshi", "Nunito Sans", "Nunito", system-ui, sans-serif',
  "--font-mono": '"JetBrains Mono", ui-monospace, monospace',
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "14px 20px 120px",
  backgroundColor: "#4F415F",
  color: "#f0e6cf",
  fontFamily: '"Nunito Sans", "Nunito", "Satoshi", system-ui, sans-serif',
};

const baseButtonStyle: CSSProperties = {
  border: "none",
  cursor: "pointer",
  transition: "all 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
};

const getStudentFirstName = (value?: string) => {
  const firstName = value?.trim().split(/\s+/)[0] ?? "";
  return firstName || "Your child";
};

const getStudentPossessive = (value: string) => {
  if (!value) return "Your child's";
  if (value === "Your child") return "Your child's";
  return value.toLowerCase().endsWith("s") ? `${value}'` : `${value}'s`;
};

const cardStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 22,
  padding: 16,
  marginBottom: 16,
};

const SectionHead: React.FC<{
  label: string;
  right?: string;
}> = ({ label, right }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    }}
  >
    <span
      style={{
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--gold)",
      }}
    >
      {label}
    </span>
    {right ? (
      <span
        style={{
          marginLeft: "auto",
          fontFamily: "'Satoshi',sans-serif",
          fontWeight: 700,
          fontSize: 12,
          color: "#c5becc",
        }}
      >
        {right}
      </span>
    ) : null}
  </div>
);

const TabButton: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`progress-v3-tab__button ${
      active ? "progress-v3-tab__button--active" : ""
    }`}
    style={{
      ...baseButtonStyle,
      appearance: "none",
      WebkitAppearance: "none",
      background: "transparent",
      boxShadow: "none",
      color: active ? "var(--gold)" : "#c5becc",
      fontFamily: "'Satoshi','Nunito Sans',sans-serif",
      fontWeight: 800,
      fontSize: 17,
      padding: "0 0 12px",
      borderBottom: active
        ? "2px solid var(--gold)"
        : "2px solid transparent",
      borderRadius: 0,
      minHeight: 40,
      minWidth: 0,
    }}
  >
    {label}
  </button>
);

const SegmentedButton: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`progress-v3-subtab__button ${
      active ? "progress-v3-subtab__button--active" : ""
    }`}
    style={{
      ...baseButtonStyle,
      appearance: "none",
      WebkitAppearance: "none",
      background: active ? "rgba(182,195,86,0.22)" : "transparent",
      color: active ? "#f0e6cf" : "#a59cb1",
      boxShadow: "none",
      borderRadius: 10,
      padding: "11px 14px",
      minHeight: 42,
      minWidth: 0,
      flex: 1,
      fontFamily: "'Satoshi','Nunito Sans',sans-serif",
      fontWeight: 800,
      fontSize: 15,
      textAlign: "center",
    }}
  >
    {label}
  </button>
);

const ScoreStat: React.FC<{ value: number }> = ({ value }) => (
  <div style={{ textAlign: "right", flexShrink: 0 }}>
    <div
      style={{
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 900,
        fontSize: 54,
        color: "var(--gold)",
        lineHeight: 0.9,
        letterSpacing: "-0.04em",
      }}
    >
      {value}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 20,
          color: "#8f869d",
          marginLeft: 2,
        }}
      >
        /100
      </span>
    </div>
  </div>
);

const LineChart: React.FC<{ scores: number[] }> = ({ scores }) => {
  const width = 250;
  const height = 88;
  const padX = 14;
  const padTop = 18;
  const padBottom = 24;
  const min = Math.min(...scores) - 6;
  const max = Math.max(...scores) + 4;
  const xStep = (width - padX * 2) / (scores.length - 1);
  const yFor = (value: number) =>
    padTop + ((max - value) / (max - min)) * (height - padTop - padBottom);
  const points = scores.map((score, index) => ({
    x: padX + index * xStep,
    y: yFor(score),
    label: `A${index + 1}`,
  }));
  const path = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
    )
    .join(" ");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <path
        d={`M${padX},${height - padBottom} L${width - padX},${height - padBottom}`}
        stroke="rgba(240,230,207,0.12)"
        strokeWidth="1"
      />
      <path
        d={path}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point, index) => (
        <g key={point.label}>
          <circle
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#2a2440"
            stroke="var(--gold)"
            strokeWidth="2"
          />
          <text
            x={point.x}
            y={point.y - 9}
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill={index === points.length - 1 ? "var(--gold)" : "#8f869d"}
            fontFamily="Satoshi,sans-serif"
          >
            {scores[index]}
          </text>
          <text
            x={point.x}
            y={height - 8}
            textAnchor="middle"
            fontSize="9"
            fill="#756b82"
            fontFamily="Satoshi,sans-serif"
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

const StatusPill: React.FC<{
  label: string;
  tone?: "gold" | "muted";
}> = ({ label, tone = "gold" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      padding: "3px 8px",
      fontFamily: "'Satoshi',sans-serif",
      fontWeight: 800,
      fontSize: 11,
      letterSpacing: "0.04em",
      textTransform: "lowercase",
      background:
        tone === "gold" ? "rgba(182,195,86,0.16)" : "rgba(240,230,207,0.08)",
      color: tone === "gold" ? "#252d06" : "#bfb7c8",
    }}
  >
    {label}
  </span>
);

const EpisodeJourneyCard: React.FC<{ episodes: AdventureEpisode[] }> = ({
  episodes,
}) => (
  <div style={cardStyle}>
    <SectionHead label="Episode Journey" />
    <div style={{ position: "relative", paddingLeft: 8 }}>
      <div
        style={{
          position: "absolute",
          left: 22,
          top: 14,
          bottom: 14,
          width: 2,
          background: "rgba(182,195,86,0.7)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {episodes.map((episode, index) => {
          const isLatest = episode.status === "latest";
          const isNext = episode.status === "next";
          const isComplete = episode.status === "complete";

          return (
            <div
              key={`${episode.title}-${index}`}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${
                    isLatest || isComplete
                      ? "var(--gold)"
                      : "rgba(240,230,207,0.18)"
                  }`,
                  background: isLatest
                    ? "#17131f"
                    : isComplete
                      ? "rgba(182,195,86,0.12)"
                      : "#262136",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  marginTop: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Satoshi',sans-serif",
                    fontWeight: 900,
                    fontSize: 11,
                    color: isLatest || isComplete ? "#f0e6cf" : "#8f869d",
                  }}
                >
                  {isNext ? "5" : episode.score}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  background: isLatest ? "var(--gold)" : "var(--surface-2)",
                  color: isLatest ? "#252d06" : "#f0e6cf",
                  border: `1px solid ${
                    isLatest
                      ? "rgba(182,195,86,0.35)"
                      : "rgba(240,230,207,0.06)"
                  }`,
                  borderRadius: 16,
                  padding: "14px 14px 12px",
                  opacity: isNext ? 0.7 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Satoshi','Nunito Sans',sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      lineHeight: 1.25,
                      flex: 1,
                    }}
                  >
                    {episode.title}
                  </div>
                  {isLatest ? <StatusPill label="latest" /> : null}
                  {isNext ? <StatusPill label="next" tone="muted" /> : null}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    lineHeight: 1.45,
                    color: isLatest ? "#3b3a19" : "#c5becc",
                  }}
                >
                  {episode.summary}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const AdventureGrowthCard: React.FC<{ items: AdventureFocus[] }> = ({
  items,
}) => (
  <div style={cardStyle}>
    <SectionHead label="Adventure Growth" />
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: "var(--surface-2)",
            borderRadius: 14,
            padding: "12px 14px",
            border: "1px solid rgba(240,230,207,0.06)",
          }}
        >
          <div
            style={{
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8f869d",
              marginBottom: 5,
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              fontFamily: "'Satoshi','Nunito Sans',sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: item.label === "Still practicing" ? "#f4b26d" : "var(--gold)",
              marginBottom: 4,
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              lineHeight: 1.45,
              color: "#c5becc",
            }}
          >
            {item.detail}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BestMomentCard: React.FC<{
  studentName: string;
  quote: ProgressQuote;
}> = ({ studentName, quote }) => (
  <div style={cardStyle}>
    <SectionHead label="Best Moment So Far" />
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: 14,
        padding: "16px 14px 14px",
        border: "1px solid rgba(240,230,207,0.06)",
      }}
    >
      <div
        style={{
          borderLeft: "2px solid var(--gold)",
          paddingLeft: 12,
          marginBottom: 14,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1.5,
            color: "#f0e6cf",
            fontStyle: "italic",
          }}
        >
          "{quote.text}"
        </p>
        <div
          style={{
            marginTop: 10,
            fontFamily: "'Satoshi',sans-serif",
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--gold)",
          }}
        >
          {quote.session}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          lineHeight: 1.55,
          color: "#c5becc",
        }}
      >
        This was {studentName}'s strongest moment so far. The idea goes beyond
        one simple feeling and shows real interpretation.
      </div>
    </div>
  </div>
);

const SkillProgressRow: React.FC<{ skill: SkillTrack }> = ({ skill }) => {
  const pct = Math.max(0, Math.min(100, (skill.score / skill.total) * 100));
  const barColor =
    skill.accent === "gold"
      ? "var(--gold)"
      : skill.accent === "coral"
        ? "#d9836a"
        : "#a37af5";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 800,
            fontSize: 16,
            color: "#f0e6cf",
          }}
        >
          {skill.name}
        </div>
        <div
          style={{
            fontFamily: "'Satoshi',sans-serif",
            fontWeight: 800,
            fontSize: 14,
            color: barColor,
          }}
        >
          {skill.score}/{skill.total}
        </div>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "rgba(240,230,207,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            borderRadius: 999,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-body)",
          fontSize: 13,
          lineHeight: 1.45,
          color: skill.accent === "coral" ? "#d8a59a" : "#9f97aa",
        }}
      >
        {skill.note}
      </div>
    </div>
  );
};

const SkillProgressCard: React.FC<{ skills: SkillTrack[] }> = ({ skills }) => {
  const total = skills.reduce((sum, skill) => sum + skill.score, 0);
  const max = skills.reduce((sum, skill) => sum + skill.total, 0);

  return (
    <div style={cardStyle}>
      <SectionHead label="Skill Progress This Adventure" />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {skills.map((skill) => (
          <SkillProgressRow key={skill.name} skill={skill} />
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid rgba(240,230,207,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'Satoshi',sans-serif",
            fontWeight: 800,
            fontSize: 14,
            color: "#8f869d",
          }}
        >
          Total
        </span>
        <span
          style={{
            fontFamily: "'Satoshi',sans-serif",
            fontWeight: 900,
            fontSize: 24,
            color: "var(--gold)",
            letterSpacing: "-0.03em",
          }}
        >
          {total}/{max}
        </span>
      </div>
    </div>
  );
};

const OverviewHeroCard: React.FC<{
  studentName: string;
  overview: AllAdventureOverview;
}> = ({ studentName, overview }) => (
  <div style={cardStyle}>
    <div
      style={{
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 900,
        fontSize: 34,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color: "#f0e6cf",
        marginBottom: 10,
      }}
    >
      {studentName}'s progress over {overview.totalAdventures} adventures
    </div>
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 15,
        lineHeight: 1.55,
        color: "#d6cdda",
        marginBottom: 16,
      }}
    >
      {overview.summary}
    </div>
    <div
      style={{
        fontFamily: "'Satoshi',sans-serif",
        fontWeight: 700,
        fontSize: 12,
        color: "#9f97aa",
        marginBottom: 8,
      }}
    >
      {overview.trendLabel}
    </div>
    <div style={{ marginBottom: 14 }}>
      <LineChart scores={overview.scores} />
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 8,
      }}
    >
      {[
        [`${overview.totalAdventures}`, "Adventures"],
        [`${overview.totalEpisodes}`, "Episodes"],
        [`${overview.totalScore}/100`, "Score"],
        [`+${overview.scoreGain}`, "In 4 weeks"],
      ].map(([value, label]) => (
        <div
          key={label}
          style={{
            background: "rgba(240,230,207,0.04)",
            borderRadius: 12,
            padding: "10px 8px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 900,
              fontSize: 16,
              color: value.startsWith("+") ? "var(--gold)" : "#f0e6cf",
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#8f869d",
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const GrowthLadderCard: React.FC<{ overview: AllAdventureOverview }> = ({
  overview,
}) => {
  const stages = [
    "Starting",
    "Building",
    "Secure",
    "Strong",
    "Greater depth",
  ];

  return (
    <div style={cardStyle}>
      <SectionHead label="Growth Ladder" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {stages.map((stage, index) => {
          const isCurrent = index === overview.growthStage;
          const isReached = index <= overview.growthStage;
          return (
            <div key={stage} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  margin: "0 auto 6px",
                  display: "grid",
                  placeItems: "center",
                  background: isCurrent
                    ? "var(--gold)"
                    : isReached
                      ? "rgba(182,195,86,0.3)"
                      : "rgba(240,230,207,0.06)",
                  border: `1px solid ${
                    isCurrent
                      ? "rgba(182,195,86,0.55)"
                      : "rgba(240,230,207,0.12)"
                  }`,
                  color: isCurrent ? "#252d06" : "#c5becc",
                  fontFamily: "'Satoshi',sans-serif",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                {index < overview.growthStage ? "✓" : index + 1}
              </div>
              <div
                style={{
                  fontFamily: "'Satoshi',sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  lineHeight: 1.2,
                  color: isCurrent ? "#f0e6cf" : "#8f869d",
                }}
              >
                {stage}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          background: "rgba(240,230,207,0.04)",
          borderRadius: 14,
          padding: "14px 14px 12px",
          border: "1px solid rgba(240,230,207,0.06)",
        }}
      >
        <div
          style={{
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 800,
            fontSize: 16,
            lineHeight: 1.4,
            color: "var(--gold)",
            marginBottom: 6,
          }}
        >
          {overview.growthHeadline}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            lineHeight: 1.55,
            color: "#d6cdda",
          }}
        >
          {overview.growthBody}
        </div>
      </div>
    </div>
  );
};

const BiggestGrowthCard: React.FC<{ overview: AllAdventureOverview }> = ({
  overview,
}) => (
  <div style={cardStyle}>
    <SectionHead label="Biggest Growth" />
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(240,230,207,0.05)",
        borderRadius: 12,
        padding: "10px 12px",
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontFamily: "'Satoshi','Nunito Sans',sans-serif",
          fontWeight: 900,
          fontSize: 24,
          color: "#f0e6cf",
        }}
      >
        {overview.biggestGrowth.skill}
      </span>
      <span
        style={{
          fontFamily: "'Satoshi',sans-serif",
          fontWeight: 800,
          fontSize: 12,
          color: "#dba0f0",
          background: "rgba(217,131,106,0.12)",
          borderRadius: 999,
          padding: "5px 8px",
        }}
      >
        +{overview.biggestGrowth.delta} marks
      </span>
    </div>
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 15,
        lineHeight: 1.6,
        color: "#d6cdda",
      }}
    >
      {overview.biggestGrowth.body}
    </div>
  </div>
);

const NextFocusCard: React.FC<{ overview: AllAdventureOverview }> = ({
  overview,
}) => (
  <div style={cardStyle}>
    <SectionHead label="Next Focus" />
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontFamily: "'Satoshi','Nunito Sans',sans-serif",
          fontWeight: 900,
          fontSize: 28,
          color: "#f0e6cf",
        }}
      >
        {overview.nextFocus.skill}
      </div>
      <StatusPill label={overview.nextFocus.state} tone="gold" />
    </div>
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 15,
        lineHeight: 1.6,
        color: "#d6cdda",
        marginBottom: 14,
      }}
    >
      {overview.nextFocus.body}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 14,
      }}
    >
      <span
        style={{
          fontFamily: "'Satoshi',sans-serif",
          fontWeight: 700,
          fontSize: 12,
          color: "#8f869d",
        }}
      >
        Target
      </span>
      <span
        style={{
          background: "rgba(182,195,86,0.2)",
          color: "#252d06",
          borderRadius: 999,
          padding: "6px 10px",
          fontFamily: "'Satoshi',sans-serif",
          fontWeight: 900,
          fontSize: 16,
        }}
      >
        {overview.nextFocus.current} → {overview.nextFocus.target}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "#9f97aa",
        }}
      >
        {overview.nextFocus.action}
      </span>
    </div>
    <SectionHead label="Try Saying" />
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {overview.nextFocus.prompts.map((sentence) => (
        <div
          key={sentence}
          style={{
            background: "#44206d",
            borderRadius: 12,
            border: "1px solid rgba(163,122,245,0.24)",
            padding: "12px 14px",
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.4,
            color: "#efe7ff",
            fontStyle: "italic",
          }}
        >
          {sentence}
        </div>
      ))}
    </div>
  </div>
);

const RecentWinsCard: React.FC<{ wins: RecentWin[] }> = ({ wins }) => (
  <div style={cardStyle}>
    <SectionHead label="Recent Wins" />
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {wins.map((win) => (
        <div
          key={`${win.adventure}-${win.tag}`}
          style={{
            background: "rgba(240,230,207,0.04)",
            borderRadius: 14,
            padding: "12px 14px",
            border: "1px solid rgba(240,230,207,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "'Satoshi',sans-serif",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}
            >
              {win.adventure}
            </span>
            <span
              style={{
                fontFamily: "'Satoshi',sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color: "#b7afc0",
                background: "rgba(240,230,207,0.07)",
                padding: "4px 8px",
                borderRadius: 999,
              }}
            >
              {win.tag}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Satoshi','Nunito Sans',sans-serif",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1.5,
              color: "#f0e6cf",
              fontStyle: "italic",
            }}
          >
            {win.quote}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AllAdventuresMissionCard: React.FC<{
  mission: AllAdventureOverview["mission"];
}> = ({ mission }) => (
  <div style={cardStyle}>
    <SectionHead label="Your Next Mission" />
    <div
      style={{
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 900,
        fontSize: 28,
        color: "#f0e6cf",
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        marginBottom: 14,
      }}
    >
      {mission.title}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {mission.steps.map((step, index) => (
        <div
          key={step}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(240,230,207,0.08)",
              border: "1px solid rgba(240,230,207,0.1)",
              display: "grid",
              placeItems: "center",
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--gold)",
              flexShrink: 0,
            }}
          >
            {index + 1}
          </div>
          <span
            style={{
              fontFamily: "'Satoshi','Nunito Sans',sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#f0e6cf",
            }}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
    <button
      type="button"
      className="progress-v3-mission-secondary"
      style={{
        ...baseButtonStyle,
        width: "100%",
        marginTop: 18,
        background: "transparent",
        color: "#d7cfdb",
        borderRadius: 16,
        padding: "15px 18px",
        border: "1px solid rgba(240,230,207,0.16)",
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 800,
        fontSize: 16,
      }}
    >
      {mission.cta}
    </button>
  </div>
);

const AdultNoteCard: React.FC<{ note: string }> = ({ note }) => {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      <button
        type="button"
        className="progress-v3-adult-toggle"
        onClick={() => setOpen((current) => !current)}
        style={{
          ...baseButtonStyle,
          width: "100%",
          background: "rgba(240,230,207,0.03)",
          borderRadius: 0,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#f0e6cf",
        }}
      >
        <span
          style={{
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          For grown-ups
        </span>
        <span
          style={{
            fontFamily: "'Satoshi',sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: "#9f97aa",
          }}
        >
          {open ? "⌃" : "⌄"}
        </span>
      </button>
      {open ? (
        <div style={{ padding: "14px 16px 16px" }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              lineHeight: 1.65,
              color: "#d6cdda",
            }}
          >
            {note}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ImproveFurtherCard: React.FC = () => (
  <div style={cardStyle}>
    <SectionHead label="To Improve Further" />
    <div
      style={{
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 700,
        fontSize: 16,
        lineHeight: 1.55,
        color: "#f0e6cf",
        marginBottom: 16,
      }}
    >
      To improve, use one detail from the story to back up your idea.
    </div>
    <SectionHead label="Try Saying" />
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        '"I know this because..."',
        '"The part that proves this is..."',
        '"This shows that..."',
      ].map((sentence) => (
        <div
          key={sentence}
          style={{
            background: "#44206d",
            borderRadius: 12,
            border: "1px solid rgba(163,122,245,0.24)",
            padding: "12px 14px",
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.4,
            color: "#efe7ff",
            fontStyle: "italic",
          }}
        >
          {sentence}
        </div>
      ))}
    </div>
  </div>
);

const NextMissionCard: React.FC<{ studentName: string }> = ({ studentName }) => (
  <div style={cardStyle}>
    <SectionHead label="Next Mission" />
    <div
      style={{
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 900,
        fontSize: 28,
        color: "#f0e6cf",
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        marginBottom: 12,
      }}
    >
      Teach Tomo
    </div>
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 15,
        lineHeight: 1.65,
        color: "#d7cfdb",
        marginBottom: 18,
      }}
    >
      In Episode 5, {studentName} will explain the whole adventure to Tomo.
      The goal is to give a clear answer, add reasons, and prove ideas with
      evidence.
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        "Say your main idea",
        "Use because",
        "Add one story detail",
        "Explain what it shows",
      ].map((step, index) => (
        <div
          key={step}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#f0e6cf",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(240,230,207,0.08)",
              border: "1px solid rgba(240,230,207,0.1)",
              display: "grid",
              placeItems: "center",
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--gold)",
              flexShrink: 0,
            }}
          >
            {index + 1}
          </div>
          <span
            style={{
              fontFamily: "'Satoshi','Nunito Sans',sans-serif",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
    <button
      type="button"
      style={{
        ...baseButtonStyle,
        width: "100%",
        marginTop: 20,
        background: "var(--gold)",
        color: "#252d06",
        borderRadius: 16,
        padding: "16px 18px",
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 900,
        fontSize: 17,
      }}
    >
      Start Episode 5
    </button>
  </div>
);

const CurrentAdventureView: React.FC<{ studentName: string }> = ({
  studentName,
}) => {
  const bestQuote = PROG_MONTHS[0].adventures[0].quotes[0];

  return (
    <>
      <div style={{ ...cardStyle, padding: "18px 16px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Satoshi',sans-serif",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 8,
              }}
            >
              Episode 4 of 5 completed
            </div>
            <div
              style={{
                fontFamily: "'Satoshi','Nunito Sans',sans-serif",
                fontWeight: 900,
                fontSize: 36,
                color: "#f0e6cf",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              Friendships
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#d4ccda",
                maxWidth: 220,
              }}
            >
              {studentName}, your thinking has grown a lot in this adventure.
            </div>
          </div>
          <ScoreStat value={63} />
        </div>
      </div>

      <EpisodeJourneyCard episodes={CURRENT_ADVENTURE_EPISODES} />
      <AdventureGrowthCard items={CURRENT_ADVENTURE_FOCUS} />
      <BestMomentCard studentName={studentName} quote={bestQuote} />
      <SkillProgressCard skills={CURRENT_ADVENTURE_SKILLS} />
      <ImproveFurtherCard />
      <NextMissionCard studentName={studentName} />
    </>
  );
};

const AllAdventuresView: React.FC<{
  studentName: string;
  studentPossessive: string;
}> = ({ studentName, studentPossessive }) => {
  const [subtab, setSubtab] = useState<"overview" | "adventures">("overview");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "rgba(240,230,207,0.05)",
          borderRadius: 14,
          padding: 4,
          display: "flex",
          gap: 4,
        }}
      >
        <SegmentedButton
          active={subtab === "overview"}
          label="Overview"
          onClick={() => setSubtab("overview")}
        />
        <SegmentedButton
          active={subtab === "adventures"}
          label="Adventures"
          onClick={() => setSubtab("adventures")}
        />
      </div>

      {subtab === "overview" ? (
        <>
          <OverviewHeroCard
            studentName={studentName}
            overview={ALL_ADVENTURES_OVERVIEW}
          />
          <GrowthLadderCard overview={ALL_ADVENTURES_OVERVIEW} />
          <BiggestGrowthCard overview={ALL_ADVENTURES_OVERVIEW} />
          <NextFocusCard overview={ALL_ADVENTURES_OVERVIEW} />
          <div style={cardStyle}>
            <SectionHead label="Skill Map" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ALL_ADVENTURES_SKILLS.map((skill) => (
                <SkillProgressRow key={skill.name} skill={skill} />
              ))}
            </div>
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid rgba(240,230,207,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'Satoshi',sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#8f869d",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "'Satoshi',sans-serif",
                  fontWeight: 900,
                  fontSize: 24,
                  color: "var(--gold)",
                  letterSpacing: "-0.03em",
                }}
              >
                74/100
              </span>
            </div>
          </div>
          <RecentWinsCard wins={ALL_ADVENTURES_OVERVIEW.recentWins} />
          <AllAdventuresMissionCard mission={ALL_ADVENTURES_OVERVIEW.mission} />
          <AdultNoteCard note={ALL_ADVENTURES_OVERVIEW.adultNote} />
        </>
      ) : (
        <>
          {PROG_MONTHS.map((month) => (
            <div key={month.label} style={cardStyle}>
              <SectionHead
                label={month.label}
                right={`${month.adventures.length} adventures`}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {month.adventures.map((adventure) => (
                  <div
                    key={`${month.label}-${adventure.title}`}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid rgba(240,230,207,0.06)",
                      borderRadius: 16,
                      padding: "14px 14px 12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Satoshi','Nunito Sans',sans-serif",
                          fontWeight: 800,
                          fontSize: 18,
                          color: "#f0e6cf",
                        }}
                      >
                        {adventure.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Satoshi',sans-serif",
                          fontWeight: 800,
                          fontSize: 13,
                          color: adventure.done ? "var(--gold)" : "#c5becc",
                        }}
                      >
                        {adventure.done
                          ? `Complete • ${adventure.dots}/${adventure.dots}`
                          : `${adventure.doneDots}/${adventure.dots} episodes`}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#c5becc",
                        marginBottom: 10,
                      }}
                    >
                      {adventure.done
                        ? `Finished ${adventure.doneDate}.`
                        : `In progress. ${adventure.words.length} new words explored so far.`}
                    </div>
                    {adventure.quotes[0] ? (
                      <div
                        style={{
                          background: "rgba(240,230,207,0.04)",
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Satoshi',sans-serif",
                            fontWeight: 800,
                            fontSize: 11,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--gold)",
                            marginBottom: 4,
                          }}
                        >
                          Best quote
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 14,
                            lineHeight: 1.5,
                            color: "#f0e6cf",
                          }}
                        >
                          "{adventure.quotes[0].text}"
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={cardStyle}>
            <SectionHead label={`${studentPossessive} Growth Across Adventures`} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PROG_MONTHS[0].growth.map((growth) => {
                const previous = growth.prev ?? 0;
                return (
                  <div key={growth.name}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Satoshi','Nunito Sans',sans-serif",
                          fontWeight: 800,
                          fontSize: 15,
                          color: "#f0e6cf",
                        }}
                      >
                        {growth.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Satoshi',sans-serif",
                          fontWeight: 800,
                          fontSize: 13,
                          color: "var(--gold)",
                        }}
                      >
                        +{growth.pct - previous}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        background: "rgba(240,230,207,0.12)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${growth.pct}%`,
                          borderRadius: 999,
                          background: "var(--gold)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "#9f97aa",
                      }}
                    >
                      {growth.cap}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ProgressSectionV3: React.FC<ProgressSectionV3Props> = ({
  conversationId,
  userName = "",
}) => {
  void conversationId;

  const studentName = useMemo(() => getStudentFirstName(userName), [userName]);
  const studentPossessive = useMemo(
    () => getStudentPossessive(studentName),
    [studentName],
  );
  const [tab, setTab] = useState<"current" | "all">("current");

  return (
    <section className="progress-v3" style={{ ...progressThemeVars, ...pageStyle }}>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 900,
            fontSize: 34,
            color: "#f0e6cf",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {studentPossessive} Progress
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "#bcb3c6",
          }}
        >
          Adventure by adventure
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 18,
          borderBottom: "1px solid rgba(240,230,207,0.08)",
          marginBottom: 16,
        }}
      >
        <TabButton
          active={tab === "current"}
          label="Current Adventure"
          onClick={() => setTab("current")}
        />
        <TabButton
          active={tab === "all"}
          label="All Adventures"
          onClick={() => setTab("all")}
        />
      </div>

      {tab === "current" ? (
        <CurrentAdventureView studentName={studentName} />
      ) : (
        <AllAdventuresView
          studentName={studentName}
          studentPossessive={studentPossessive}
        />
      )}
    </section>
  );
};

export default ProgressSectionV3;
