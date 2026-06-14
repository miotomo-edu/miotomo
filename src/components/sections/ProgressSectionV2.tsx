import React, { CSSProperties, useEffect, useMemo, useState } from "react";

type ProgressSectionV2Props = {
  conversationId?: string;
  userName?: string;
};

type ProgressSkill = {
  name: string;
  pct: number;
  p?: number;
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

type ProgressDay = {
  day: string;
  date: string;
  s: boolean;
  today?: boolean;
  dot?: string;
  circle?: string;
  dur?: number;
  speak?: number;
  score?: number;
  sPrev?: number;
  words?: string[];
  q?: ProgressQuote;
  skills?: ProgressSkill[];
};

type ProgressWeek = {
  label: string;
  days: ProgressDay[];
};

type ProgressMonth = {
  label: string;
  short: string;
  sessions: number;
  streak: number;
  scoreJourney: number[];
  speakTotal: number;
  speakAvg: number;
  speakAvgPrev: number;
  weekBars: { l: string; n: number }[];
  adventures: ProgressAdventure[];
  growth: ProgressSkill[];
  skills: {
    tier: "gold" | "silver" | "bronze";
    title: string;
    evidence: string;
  }[];
  next: string[];
};

const PROG_WEEKS: ProgressWeek[] = [
  {
    label: "Jun 9 – 15",
    days: [
      {
        day: "M",
        date: "Jun 9",
        s: true,
        dot: "Dot 3",
        circle: "Friendship",
        dur: 12,
        speak: 5,
        score: 68,
        sPrev: 62,
        words: ["Honest", "Courage"],
        q: {
          text: "I think Tomo should just be honest even if it hurts.",
          skill: "Diplomacy",
          session: "Dot 3",
        },
        skills: [
          {
            name: "Storytelling",
            pct: 48,
            p: 42,
            cap: "Retold 3 key events in order.",
          },
        ],
      },
      { day: "T", date: "Jun 10", s: false },
      {
        day: "W",
        date: "Jun 11",
        s: true,
        today: true,
        dot: "Dot 4",
        circle: "Friendship",
        dur: 14,
        speak: 6,
        score: 72,
        sPrev: 68,
        words: ["Betrayal", "Empathy"],
        q: {
          text: "Lucius knew he was wrong but didn't want to admit it — that's really hard.",
          skill: "Critical thinking",
          session: "Dot 4",
        },
        skills: [
          {
            name: "Critical thinking",
            pct: 72,
            p: 68,
            cap: "Held a position under 3 follow-up questions.",
          },
          {
            name: "Speaking confidence",
            pct: 58,
            p: 52,
            cap: "Longest turn today: 22 seconds.",
          },
        ],
      },
      { day: "T", date: "Jun 12", s: false },
      { day: "F", date: "Jun 13", s: false },
      { day: "S", date: "Jun 14", s: false },
      { day: "S", date: "Jun 15", s: false },
    ],
  },
  {
    label: "Jun 2 – 8",
    days: [
      { day: "M", date: "Jun 2", s: false },
      { day: "T", date: "Jun 3", s: false },
      { day: "W", date: "Jun 4", s: false },
      {
        day: "T",
        date: "Jun 5",
        s: true,
        dot: "Dot 1",
        circle: "Friendship",
        dur: 9,
        speak: 3,
        score: 56,
        sPrev: 50,
        words: ["Trust", "Enormous"],
        q: {
          text: "Being a good friend means being there even when it's hard.",
          skill: "Storytelling",
          session: "Dot 1",
        },
        skills: [
          {
            name: "Storytelling",
            pct: 32,
            p: 22,
            cap: "First retell — confident start.",
          },
        ],
      },
      { day: "F", date: "Jun 6", s: false },
      {
        day: "S",
        date: "Jun 7",
        s: true,
        dot: "Dot 2",
        circle: "Friendship",
        dur: 11,
        speak: 4,
        score: 62,
        sPrev: 56,
        words: ["Loyalty", "Jealousy"],
        q: {
          text: "A real friend tells you the truth even when it's hard to hear.",
          skill: "Storytelling",
          session: "Dot 2",
        },
        skills: [
          {
            name: "Vocabulary",
            pct: 40,
            p: 28,
            cap: "Used 'loyalty' correctly in context.",
          },
        ],
      },
      { day: "S", date: "Jun 8", s: false },
    ],
  },
];

const PROG_MONTHS: ProgressMonth[] = [
  {
    label: "June 2026",
    short: "Jun",
    sessions: 8,
    streak: 8,
    scoreJourney: [56, 62, 68, 72],
    speakTotal: 42,
    speakAvg: 18,
    speakAvgPrev: 4,
    weekBars: [
      { l: "Wk 1", n: 3 },
      { l: "Wk 2", n: 5 },
      { l: "Wk 3", n: 0 },
      { l: "Wk 4", n: 0 },
    ],
    adventures: [
      {
        title: "Friendship",
        dots: 5,
        done: true,
        doneDate: "Jun 11",
        doneDots: 5,
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
            session: "Dot 4",
            text: "Lucius betrayed his friend because he wanted power — but I think he was also scared.",
            skill: "Critical thinking",
          },
          {
            session: "Dot 2",
            text: "A real friend tells you the truth even when it's hard to hear.",
            skill: "Storytelling",
          },
          {
            session: "Dot 5",
            text: "I think they should talk instead of fighting because fighting makes it worse.",
            skill: "Diplomacy",
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
            session: "Dot 3",
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
        cap: "Held counter-arguments across 4 Dots.",
      },
      {
        name: "Speaking confidence",
        pct: 58,
        prev: 8,
        cap: "Average spoken turn grew from 4s → 18s.",
      },
      {
        name: "Vocabulary",
        pct: 65,
        prev: 14,
        cap: "17 new words used correctly in context.",
      },
      {
        name: "Listening comprehension",
        pct: 80,
        prev: 40,
        cap: "Completed all story segments without replays.",
      },
      {
        name: "Storytelling",
        pct: 55,
        prev: 22,
        cap: "Retold events with cause and effect.",
      },
      {
        name: "Spelling",
        pct: 70,
        prev: 30,
        cap: "7 of 10 words correct on first attempt.",
      },
      {
        name: "Memory & recall",
        pct: 45,
        prev: 15,
        cap: "Recalled 4 of 5 key story events in Teachtime.",
      },
    ],
    skills: [
      {
        tier: "gold",
        title: "Critical thinking",
        evidence: "Held counter-arguments across 4 Dots.",
      },
      {
        tier: "silver",
        title: "Speaking confidence",
        evidence: "Turn length grew 4s → 18s in 8 sessions.",
      },
      {
        tier: "silver",
        title: "Vocabulary",
        evidence: "Used 'empathy' and 'betrayal' correctly.",
      },
      {
        tier: "silver",
        title: "Listening comprehension",
        evidence: "Completed all story segments, no replays.",
      },
      {
        tier: "silver",
        title: "Storytelling",
        evidence: "Retold Dot 2 with full cause and effect.",
      },
      {
        tier: "bronze",
        title: "Spelling",
        evidence: "7 of 10 words correct on first attempt.",
      },
      {
        tier: "bronze",
        title: "Memory & recall",
        evidence: "Recalled 4 of 5 key story events.",
      },
    ],
    next: [
      "Hold an argument for 3+ turns without dropping the point",
      "Use newly learned words in a full sentence unprompted",
    ],
  },
  {
    label: "May 2026",
    short: "May",
    sessions: 5,
    streak: 5,
    scoreJourney: [40, 45, 48, 52, 56],
    speakTotal: 18,
    speakAvg: 8,
    speakAvgPrev: 3,
    weekBars: [
      { l: "Wk 1", n: 2 },
      { l: "Wk 2", n: 3 },
      { l: "Wk 3", n: 0 },
      { l: "Wk 4", n: 0 },
    ],
    adventures: [
      {
        title: "Friendship",
        dots: 5,
        done: false,
        doneDots: 3,
        words: ["Trust", "Enormous", "Loyalty", "Courage", "Defend"],
        quotes: [
          {
            session: "Dot 3",
            text: "I think Tomo should just be honest even if it hurts.",
            skill: "Diplomacy",
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
        cap: "Turn length grew from 3s → 8s.",
      },
      {
        name: "Vocabulary",
        pct: 38,
        prev: 10,
        cap: "5 new words used in context.",
      },
      {
        name: "Listening comprehension",
        pct: 55,
        prev: 30,
        cap: "Completed 3 of 5 story segments.",
      },
      {
        name: "Storytelling",
        pct: 32,
        prev: 10,
        cap: "First retells — building confidence.",
      },
      {
        name: "Spelling",
        pct: 45,
        prev: 20,
        cap: "5 of 10 words correct on first attempt.",
      },
      {
        name: "Memory & recall",
        pct: 28,
        prev: 8,
        cap: "Recalled 2 of 5 key story events.",
      },
    ],
    skills: [
      {
        tier: "silver",
        title: "Listening comprehension",
        evidence: "Completed 3 of 5 story segments.",
      },
      {
        tier: "bronze",
        title: "Critical thinking",
        evidence: "Started forming basic arguments.",
      },
      {
        tier: "bronze",
        title: "Vocabulary",
        evidence: "5 new words used in context.",
      },
      {
        tier: "bronze",
        title: "Storytelling",
        evidence: "First retells attempted.",
      },
      {
        tier: "bronze",
        title: "Spelling",
        evidence: "Building word recall.",
      },
    ],
    next: [
      "Build confidence in retelling stories to Tomo",
      "Keep using new words in full sentences",
    ],
  },
];

const TIER_STYLES = {
  gold: { bg: "var(--gold-badge)", color: "#252d06", label: "Strong" },
  silver: { bg: "var(--silver-badge)", color: "#2b2b33", label: "Growing" },
  bronze: { bg: "#b86a28", color: "#fff", label: "Rising" },
} as const;

const progressThemeVars: CSSProperties & Record<string, string> = {
  "--gold": "#b6c356",
  "--gold-badge": "#9aaa3e",
  "--silver-badge": "#a9abb4",
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

const getStudentFirstName = (value?: string) => {
  const firstName = value?.trim().split(/\s+/)[0] ?? "";
  return firstName || "Your child";
};

const getStudentPossessive = (value: string) => {
  if (!value) return "Your child's";
  if (value === "Your child") return "Your child's";
  return value.toLowerCase().endsWith("s") ? `${value}'` : `${value}'s`;
};

const baseButtonStyle: CSSProperties = {
  border: "none",
  cursor: "pointer",
  transition: "all 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
};

const SectionHead: React.FC<{
  color: string;
  label: string;
  right?: string;
}> = ({ color, label, right }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginBottom: 14,
    }}
  >
    <div
      style={{
        width: 4,
        height: 18,
        borderRadius: 2,
        background: color,
        flexShrink: 0,
      }}
    />
    <span
      style={{
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 700,
        fontSize: 16,
        color: "#f0e6cf",
      }}
    >
      {label}
    </span>
    {right ? (
      <span
        style={{
          fontFamily: "'Satoshi',sans-serif",
          fontSize: 13,
          color: "#c5becc",
          marginLeft: "auto",
        }}
      >
        {right}
      </span>
    ) : null}
  </div>
);

const NavBar: React.FC<{
  label: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}> = ({ label, canPrev, canNext, onPrev, onNext }) => {
  const navButtonStyle = (disabled: boolean): CSSProperties => ({
    ...baseButtonStyle,
    background: "none",
    color: disabled ? "rgba(197,190,204,0.18)" : "#c5becc",
    padding: "10px 16px",
    fontSize: 22,
    lineHeight: 1,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    cursor: disabled ? "default" : "pointer",
  });

  return (
    <div
      className="progress-v2-nav"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#2a2440",
        borderRadius: 14,
        padding: "4px",
        marginBottom: 16,
        border: "1px solid rgba(240,230,207,0.06)",
      }}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className="progress-v2-nav__button"
        style={navButtonStyle(!canPrev)}
      >
        ‹
      </button>
      <span
        style={{
          fontFamily: "'Satoshi','Nunito Sans',sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: "#c5becc",
        }}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="progress-v2-nav__button"
        style={navButtonStyle(!canNext)}
      >
        ›
      </button>
    </div>
  );
};

const ScoreRing: React.FC<{ score: number; delta: number }> = ({
  score,
  delta,
}) => {
  const r = 38;
  const cx = 48;
  const cy = 48;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(240,230,207,0.1)"
            strokeWidth="8"
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="8"
            strokeDasharray={`${fill} ${circ - fill}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 900,
              fontSize: 26,
              color: "#f0e6cf",
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontFamily: "'Satoshi',sans-serif",
              fontSize: 13,
              color: "#c5becc",
            }}
          >
            /100
          </span>
        </div>
      </div>
      {delta > 0 ? (
        <span
          style={{
            fontFamily: "'Satoshi',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "var(--gold)",
          }}
        >
          ↑ +{delta} today
        </span>
      ) : null}
      <span
        style={{
          fontFamily: "'Satoshi',sans-serif",
          fontSize: 13,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#c5becc",
        }}
      >
        Score
      </span>
    </div>
  );
};

const ScoreSparkline: React.FC<{
  scores: number[];
  studentName: string;
}> = ({ scores, studentName }) => {
  if (!scores || scores.length < 2) return null;

  const avgScores = scores.map((_, index) =>
    [48, 52, 55, 58][index] !== undefined ? [48, 52, 55, 58][index] : 55,
  );
  const width = 280;
  const height = 72;
  const pad = 24;
  const topPad = 28;
  const allValues = [...scores, ...avgScores];
  const lo = Math.min(...allValues) - 12;
  const hi = Math.max(...allValues) + 10;
  const xStep = (width - pad * 2) / (scores.length - 1);
  const yFor = (value: number) =>
    topPad + height - ((value - lo) / (hi - lo)) * height;
  const points = scores.map((score, index) => [pad + index * xStep, yFor(score)]);
  const avgPoints = avgScores.map((score, index) => [
    pad + index * xStep,
    yFor(score),
  ]);
  const path = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${point[0].toFixed(1)},${point[1].toFixed(1)}`,
    )
    .join(" ");
  const avgPath = avgPoints
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${point[0].toFixed(1)},${point[1].toFixed(1)}`,
    )
    .join(" ");
  const totalHeight = topPad + height + 28;

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${totalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <linearGradient id="scoreGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L${points[points.length - 1][0].toFixed(1)},${topPad + height + 4} L${points[0][0].toFixed(1)},${topPad + height + 4} Z`}
          fill="url(#scoreGrad2)"
        />
        <path
          d={avgPath}
          fill="none"
          stroke="rgba(197,190,204,0.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 3"
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
          <g key={`${point[0]}-${point[1]}`}>
            <circle
              cx={point[0]}
              cy={point[1]}
              r="6"
              fill="#2a2440"
              stroke="var(--gold)"
              strokeWidth="2.2"
            />
            <text
              x={point[0]}
              y={point[1] - 13}
              textAnchor="middle"
              fontSize="13"
              fill="#f0e6cf"
              fontFamily="Satoshi,sans-serif"
              fontWeight="700"
            >
              {scores[index]}
            </text>
            <text
              x={point[0]}
              y={topPad + height + 22}
              textAnchor="middle"
              fontSize="12"
              fill="#c5becc"
              fontFamily="Satoshi,sans-serif"
            >
              S{index + 1}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontFamily: "'Satoshi',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "var(--gold)",
          }}
        >
          <div
            style={{
              width: 20,
              height: 2.5,
              background: "var(--gold)",
              borderRadius: 2,
            }}
          />
          {studentName}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontFamily: "'Satoshi',sans-serif",
            fontSize: 13,
            color: "rgba(197,190,204,0.8)",
          }}
        >
          <svg width="20" height="5" viewBox="0 0 20 5">
            <line
              x1="0"
              y1="2.5"
              x2="20"
              y2="2.5"
              stroke="rgba(197,190,204,0.6)"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
          </svg>
          Avg 10 yr old
        </div>
      </div>
    </div>
  );
};

const GrowthBar: React.FC<{ growth: ProgressSkill }> = ({ growth }) => {
  const previous = growth.prev ?? growth.p ?? 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 7,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 16,
            color: "#f0e6cf",
          }}
        >
          {growth.name}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--gold)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            {growth.pct - previous}%
          </span>
          <span
            style={{
              background: "rgba(182,195,86,0.15)",
              color: "var(--gold)",
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            {growth.pct}%
          </span>
        </div>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "rgba(240,230,207,0.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            background: "var(--gold)",
            width: `${growth.pct}%`,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "#c5becc",
          marginTop: 8,
        }}
      >
        {growth.cap}
      </div>
    </div>
  );
};

const QuoteCard: React.FC<{ quote: ProgressQuote }> = ({ quote }) => (
  <div
    style={{
      background: "#2a2440",
      borderRadius: 14,
      padding: "14px 16px",
      border: "1px solid rgba(240,230,207,0.08)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontFamily: "'Satoshi',sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--gold)",
        }}
      >
        {quote.session}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "#c5becc",
          background: "rgba(240,230,207,0.07)",
          padding: "4px 10px",
          borderRadius: 999,
        }}
      >
        {quote.skill}
      </span>
    </div>
    <p
      style={{
        fontFamily: "'Satoshi','Nunito Sans',sans-serif",
        fontWeight: 500,
        fontSize: 16,
        lineHeight: 1.55,
        color: "#f0e6cf",
        margin: 0,
        fontStyle: "italic",
      }}
    >
      "{quote.text}"
    </p>
  </div>
);

const WordChips: React.FC<{ words: string[] }> = ({ words }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {words.map((word) => (
      <span
        key={word}
        style={{
          background: "#3a1858",
          color: "#ede8f5",
          border: "1px solid rgba(94,100,255,0.2)",
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: 16,
          padding: "8px 15px",
          borderRadius: 999,
        }}
      >
        {word}
      </span>
    ))}
  </div>
);

const DailyView: React.FC<{
  day?: ProgressDay;
  studentName: string;
}> = ({ day, studentName }) => {
  if (!day || !day.s) {
    return (
      <div
        style={{
          background: "#322a4a",
          border: "1px solid rgba(240,230,207,0.07)",
          borderRadius: 20,
          padding: "36px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 30, marginBottom: 10 }}>🌙</div>
        <div
          style={{
            fontFamily: "'Satoshi',sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#f0e6cf",
            marginBottom: 6,
          }}
        >
          Rest day
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "#c5becc",
            lineHeight: 1.6,
          }}
        >
          No session on {day ? day.date : "this day"}. Good learners take breaks
          too.
        </div>
      </div>
    );
  }

  return (
    <>
      {day.skills && day.skills.length > 0 ? (
        <div style={{ marginBottom: 16 }}>
          <SectionHead color="#5ec44e" label="Skills improved today" />
          <div
            style={{
              background: "#322a4a",
              border: "1px solid rgba(240,230,207,0.08)",
              borderRadius: 20,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {day.skills.map((skill, index) => (
              <GrowthBar
                key={`${skill.name}-${index}`}
                growth={{ ...skill, prev: skill.p }}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ marginBottom: 16 }}>
        <SectionHead
          color="var(--gold)"
          label={`Words ${studentName} met today`}
          right={`${day.words?.length ?? 0} new`}
        />
        <WordChips words={day.words ?? []} />
      </div>
    </>
  );
};

const Drawer: React.FC<{
  label: string;
  color: string;
  right?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ label, color, right, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          ...baseButtonStyle,
          width: "100%",
          background: "#322a4a",
          border: "1px solid rgba(240,230,207,0.08)",
          borderRadius: open ? "16px 16px 0 0" : 16,
          padding: "16px 18px",
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          gap: 9,
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 4,
            height: 18,
            borderRadius: 2,
            background: color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#f0e6cf",
            flex: 1,
          }}
        >
          {label}
        </span>
        {right ? (
          <span
            style={{
              fontFamily: "'Satoshi',sans-serif",
              fontSize: 13,
              color: "#c5becc",
            }}
          >
            {right}
          </span>
        ) : null}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c5becc"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms",
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open ? (
        <div
          style={{
            background: "#2a2440",
            border: "1px solid rgba(240,230,207,0.08)",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            padding: 16,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};

const MonthlyView: React.FC<{
  month: ProgressMonth;
  studentName: string;
  studentPossessive: string;
}> = ({ month, studentName, studentPossessive }) => {
  const allWords = month.adventures.flatMap((adventure) => adventure.words);
  const allQuotes = month.adventures.flatMap((adventure) => adventure.quotes);

  return (
    <>
      <div
        style={{
          background: "#322a4a",
          border: "1px solid rgba(240,230,207,0.1)",
          borderRadius: 22,
          padding: "20px 20px 16px",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 6,
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Satoshi',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 6,
              }}
            >
              Comprehension score
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "'Satoshi',sans-serif",
                  fontWeight: 900,
                  fontSize: 48,
                  color: "var(--gold)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {month.scoreJourney[month.scoreJourney.length - 1]}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  color: "#9d93a8",
                }}
              >
                /100
              </span>
            </div>
          </div>
          <div
            style={{
              background: "rgba(182,195,86,0.15)",
              border: "1px solid rgba(182,195,86,0.3)",
              borderRadius: 14,
              padding: "10px 14px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Satoshi',sans-serif",
                fontWeight: 900,
                fontSize: 22,
                color: "var(--gold)",
                lineHeight: 1,
              }}
            >
              +
              {month.scoreJourney[month.scoreJourney.length - 1] -
                month.scoreJourney[0]}
            </div>
            <div
              style={{
                fontFamily: "'Satoshi',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--gold)",
                opacity: 0.85,
                marginTop: 4,
              }}
            >
              this month
            </div>
          </div>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "#e0d8c0",
            margin: "0 0 18px",
            lineHeight: 1.5,
          }}
        >
          {studentName} started at {month.scoreJourney[0]} and reached{" "}
          {month.scoreJourney[month.scoreJourney.length - 1]} — real growth
          across every session.
        </p>
        <ScoreSparkline scores={month.scoreJourney} studentName={studentName} />
      </div>

      <Drawer
        label={`${studentPossessive} skill passport`}
        color="#5ec44e"
        right={`${month.skills.length} skills`}
        defaultOpen={true}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {month.growth.map((growth, index) => {
            const skill = month.skills.find((item) => item.title === growth.name);
            const tierStyle =
              TIER_STYLES[skill?.tier ?? "bronze"] ?? TIER_STYLES.bronze;
            const nextTier =
              skill?.tier === "bronze"
                ? "silver"
                : skill?.tier === "silver"
                  ? "gold"
                  : null;
            const nextPct =
              skill?.tier === "bronze"
                ? 60
                : skill?.tier === "silver"
                  ? 80
                  : null;

            return (
              <div
                key={`${growth.name}-${index}`}
                style={{
                  background: "#322a4a",
                  border: "1px solid rgba(240,230,207,0.08)",
                  borderRadius: 16,
                  padding: "18px 16px",
                  marginBottom: index < month.growth.length - 1 ? 10 : 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Satoshi','Nunito Sans',sans-serif",
                      fontWeight: 700,
                      fontSize: 17,
                      color: "#f0e6cf",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {growth.name}
                  </span>
                  <span
                    style={{
                      background: "rgba(182,195,86,0.15)",
                      color: "var(--gold)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 14,
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: "4px 12px",
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {growth.pct}%
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 800,
                      fontSize: 14,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      borderRadius: 999,
                      padding: "5px 13px",
                      background: tierStyle.bg,
                      color: tierStyle.color,
                      flexShrink: 0,
                    }}
                  >
                    {tierStyle.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Satoshi',sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--gold)",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    +{growth.pct - (growth.prev ?? 0)}% this month
                  </span>
                </div>

                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    background: "rgba(240,230,207,0.2)",
                    overflow: "hidden",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 999,
                      background: "var(--gold)",
                      width: `${growth.pct}%`,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "#c5becc",
                    lineHeight: 1.55,
                    marginBottom: nextTier ? 10 : 0,
                  }}
                >
                  {growth.cap}
                </div>

                {nextTier && nextPct ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(240,230,207,0.04)",
                      borderRadius: 10,
                      padding: "10px 12px",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9d93a8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 8 12 12 14 14" />
                    </svg>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 14,
                        color: "#c5becc",
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      <span>
                        Reach{" "}
                        <span
                          style={{ color: "#f0e6cf", fontWeight: 700 }}
                        >
                          {nextPct}%
                        </span>{" "}
                        to unlock
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 800,
                          fontSize: 13,
                          textTransform: "uppercase",
                          background: TIER_STYLES[nextTier].bg,
                          color: TIER_STYLES[nextTier].color,
                          borderRadius: 999,
                          padding: "4px 11px",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {TIER_STYLES[nextTier].label}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      color: "var(--gold)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Mastery achieved
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Drawer>

      <Drawer
        label="Adventures this month"
        color="var(--gold)"
        right={`${month.adventures.length} circles`}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {month.adventures.map((adventure, index) => (
            <div
              key={`${adventure.title}-${index}`}
              style={{
                background: adventure.done
                  ? "linear-gradient(135deg,#2d2060 0%,#1e1040 100%)"
                  : "#322a4a",
                border: `1px solid ${
                  adventure.done
                    ? "rgba(182,195,86,0.3)"
                    : "rgba(240,230,207,0.08)"
                }`,
                borderRadius: 18,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                boxShadow: adventure.done
                  ? "0 6px 20px -10px rgba(182,195,86,0.25)"
                  : "none",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: adventure.done
                    ? "rgba(182,195,86,0.15)"
                    : "rgba(240,230,207,0.06)",
                  border: `2px solid ${
                    adventure.done
                      ? "var(--gold)"
                      : "rgba(240,230,207,0.12)"
                  }`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {adventure.done ? (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3l2.7 5.4 6 .9-4.3 4.2 1 6L12 17l-5.4 2.8 1-6L3.3 9.3l6-.9z" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontFamily: "'Satoshi',sans-serif",
                      fontWeight: 900,
                      fontSize: 13,
                      color: "#9d93a8",
                    }}
                  >
                    {adventure.doneDots}/5
                  </span>
                )}
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Satoshi',sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#f0e6cf",
                    }}
                  >
                    {adventure.title}
                  </span>
                  {adventure.done ? (
                    <span
                      style={{
                        fontFamily: "'Satoshi',sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        background: "rgba(182,195,86,0.15)",
                        color: "var(--gold)",
                        padding: "4px 10px",
                        borderRadius: 999,
                      }}
                    >
                      Complete
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "#c5becc",
                  }}
                >
                  {adventure.done
                    ? `All 5 Episodes · finished ${adventure.doneDate}`
                    : `Episode ${adventure.doneDots} of ${adventure.dots} in progress`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Drawer>

      <Drawer
        label="Words learned"
        color="var(--gold)"
        right={`${allWords.length} words`}
      >
        <WordChips words={allWords} />
      </Drawer>

      <Drawer label={`What ${studentName} said`} color="#d9836a">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {allQuotes.map((quote, index) => (
            <QuoteCard
              key={`${quote.session}-${index}`}
              quote={quote}
            />
          ))}
        </div>
      </Drawer>

      <Drawer
        label={`Next up for ${studentName}`}
        color="#5b86a8"
        right="Circle ahead"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {month.next.map((item, index) => (
            <div
              key={`${item}-${index}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                background: "#322a4a",
                borderRadius: 14,
                padding: "14px 16px",
                border: "1px solid rgba(240,230,207,0.08)",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(91,134,168,0.18)",
                  border: "1px solid rgba(91,134,168,0.35)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontFamily: "'Satoshi',sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#5b86a8",
                }}
              >
                {index + 1}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: "#e0d8c0",
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};

const ProgressSectionV2: React.FC<ProgressSectionV2Props> = ({
  conversationId,
  userName = "",
}) => {
  void conversationId;

  const studentName = useMemo(() => getStudentFirstName(userName), [userName]);
  const studentPossessive = useMemo(
    () => getStudentPossessive(studentName),
    [studentName],
  );
  const [range, setRange] = useState<"Daily" | "Monthly">("Daily");
  const [weekIndex, setWeekIndex] = useState(0);
  const week = PROG_WEEKS[weekIndex];

  const getDefaultDayIndex = (days: ProgressDay[]) =>
    days.reduce((selectedIndex, day, index) => {
      if (day.today) return index;
      if (day.s) return index;
      return selectedIndex;
    }, 0);

  const [dayIndex, setDayIndex] = useState(() => getDefaultDayIndex(week.days));
  const [monthIndex, setMonthIndex] = useState(0);
  const month = PROG_MONTHS[monthIndex];

  useEffect(() => {
    setDayIndex(getDefaultDayIndex(PROG_WEEKS[weekIndex].days));
  }, [weekIndex]);

  const day = week.days[dayIndex];

  const dailyHeadlines = [
    { minScore: 70, text: "Best session this week." },
    { minScore: 60, text: "Good session — improving steadily." },
    { minScore: 0, text: "Every session builds something." },
  ];

  const getDailyHeadline = (currentDay?: ProgressDay) => {
    if (!currentDay || !currentDay.s) return "Rest day.";
    return (
      dailyHeadlines.find(
        (headline) => (currentDay.score ?? 0) >= headline.minScore,
      ) ?? dailyHeadlines[2]
    ).text;
  };

  const hero =
    range === "Daily"
      ? day && day.s
        ? {
            eyebrow: `${day.date} · ${day.circle} · Episode ${day.dot?.replace("Dot ", "")}`,
            headline: getDailyHeadline(day),
            stats: [
              ["Session", `${day.dur} min`],
              ["Speaking", `${day.speak} min`],
            ] as const,
          }
        : {
            eyebrow: day?.date ?? "Today",
            headline: "Rest day.",
            stats: [
              ["Score", "—"],
              ["Session", "—"],
              ["Speaking", "—"],
            ] as const,
          }
      : {
          eyebrow: `${month.label} · ${month.sessions} sessions`,
          headline: `${studentName} is building real arguments.`,
          stats: [
            [`${month.sessions}`, "Sessions"],
            [`${month.speakTotal} min`, "Speaking"],
          ] as const,
          note: `${month.sessions} consistent sessions and ${month.speakTotal} minutes of speaking — ${studentName} is showing up and getting stronger.`,
        };

  return (
    <section className="progress-v2" style={{ ...progressThemeVars, ...pageStyle }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingTop: 4,
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'Satoshi','Nunito Sans',sans-serif",
            fontWeight: 900,
            fontSize: 22,
            color: "#f0e6cf",
            letterSpacing: "-0.02em",
          }}
        >
          Progress
        </span>
        <div
          style={{
            display: "flex",
            background: "#2a2440",
            borderRadius: 999,
            padding: 3,
            gap: 2,
            border: "1px solid rgba(240,230,207,0.06)",
          }}
        >
          {(["Daily", "Monthly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`progress-v2-toggle__button ${
                range === value ? "progress-v2-toggle__button--active" : ""
              }`}
              style={{
                ...baseButtonStyle,
                background: range === value ? "#f0e6cf" : "transparent",
                color: range === value ? "#2a2440" : "#c5becc",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 14,
                padding: "8px 18px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {range === "Monthly" ? (
        <NavBar
          label={month.label}
          canPrev={monthIndex < PROG_MONTHS.length - 1}
          canNext={monthIndex > 0}
          onPrev={() => setMonthIndex((current) => current + 1)}
          onNext={() => setMonthIndex((current) => current - 1)}
        />
      ) : (
        <>
          <NavBar
            label={`Week of ${week.label}`}
            canPrev={weekIndex < PROG_WEEKS.length - 1}
            canNext={weekIndex > 0}
            onPrev={() => setWeekIndex((current) => current + 1)}
            onNext={() => setWeekIndex((current) => current - 1)}
          />
          <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
            {week.days.map((currentDay, index) => {
              const isSelected = index === dayIndex;
              const hasSession = currentDay.s;
              const isToday = currentDay.today;

              return (
                <button
                  key={`${currentDay.date}-${index}`}
                  type="button"
                  className={`progress-v2-day__button ${
                    isSelected
                      ? "progress-v2-day__button--selected"
                      : hasSession
                        ? "progress-v2-day__button--session"
                        : "progress-v2-day__button--idle"
                  }`}
                  onClick={() => {
                    if (hasSession) {
                      setDayIndex(index);
                    }
                  }}
                  style={{
                    ...baseButtonStyle,
                    flex: 1,
                    border:
                      isToday && !isSelected
                        ? "1.5px solid var(--gold)"
                        : "1.5px solid transparent",
                    cursor: hasSession ? "pointer" : "default",
                    borderRadius: 12,
                    padding: "10px 0",
                    minHeight: 44,
                    background: isSelected
                      ? "var(--gold)"
                      : hasSession
                        ? "rgba(182,195,86,0.12)"
                        : "rgba(240,230,207,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Satoshi',sans-serif",
                      fontSize: 12,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: isSelected
                        ? "#252d06"
                        : hasSession
                          ? "var(--gold)"
                          : "rgba(197,190,204,0.35)",
                      fontWeight: 700,
                    }}
                  >
                    {currentDay.day}
                  </span>
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isSelected
                        ? "#252d06"
                        : hasSession
                          ? "var(--gold)"
                          : "rgba(240,230,207,0.08)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}

      {range === "Daily" && day && day.s ? (
        <div
          style={{
            background: "#322a4a",
            border: "1px solid rgba(240,230,207,0.1)",
            borderRadius: 22,
            padding: 20,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 14,
            }}
          >
            {hero.eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 16,
            }}
          >
            <ScoreRing
              score={day.score ?? 0}
              delta={(day.score ?? 0) - (day.sPrev ?? 0)}
            />
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontFamily: "'Satoshi','Nunito Sans',sans-serif",
                  fontWeight: 900,
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                  color: "#f0e6cf",
                  margin: "0 0 12px",
                  lineHeight: 1.1,
                }}
              >
                {hero.headline}
              </h1>
              <div style={{ display: "flex", gap: 8 }}>
                {hero.stats.map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: "rgba(240,230,207,0.06)",
                      borderRadius: 10,
                      padding: "8px 12px",
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Satoshi',sans-serif",
                        fontWeight: 900,
                        fontSize: 16,
                        color: "#f0e6cf",
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Satoshi',sans-serif",
                        fontSize: 12,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "#c5becc",
                        marginTop: 4,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {day.q ? (
            <div
              style={{
                background: "#2a2440",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Satoshi',sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: 8,
                }}
              >
                What {studentName} said today
              </div>
              <p
                style={{
                  fontFamily: "'Satoshi',sans-serif",
                  fontWeight: 500,
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: "#f0e6cf",
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                "{day.q.text}"
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          style={{
            background: "#322a4a",
            border: "1px solid rgba(240,230,207,0.1)",
            borderRadius: 22,
            padding: "20px 20px 18px",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontFamily: "'Satoshi',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 10,
            }}
          >
            {hero.eyebrow}
          </div>
          <h1
            style={{
              fontFamily: "'Satoshi','Nunito Sans',sans-serif",
              fontWeight: 900,
              fontSize: 24,
              letterSpacing: "-0.02em",
              color: "#f0e6cf",
              margin: "0 0 14px",
              lineHeight: 1.1,
            }}
          >
            {hero.headline}
          </h1>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: "note" in hero && hero.note ? 14 : 0,
            }}
          >
            {hero.stats.map(([value, label]) => (
              <div
                key={label}
                style={{
                  background: "rgba(240,230,207,0.06)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Satoshi',sans-serif",
                    fontWeight: 900,
                    fontSize: 18,
                    color: "var(--gold)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: "'Satoshi',sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "#c5becc",
                    marginTop: 4,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          {"note" in hero && hero.note ? (
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(182,195,86,0.12) 0%, rgba(182,195,86,0.06) 100%)",
                border: "1px solid rgba(182,195,86,0.22)",
                borderRadius: 14,
                padding: "14px 16px",
                marginTop: 14,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
                🌟
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "'Satoshi','Nunito Sans',sans-serif",
                    fontWeight: 900,
                    fontSize: 16,
                    color: "var(--gold)",
                    letterSpacing: "-0.01em",
                    marginBottom: 4,
                  }}
                >
                  That's a real commitment.
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: "#e0d8c0",
                  }}
                >
                  {hero.note}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {range === "Daily" ? (
        <DailyView day={day} studentName={studentName} />
      ) : (
        <MonthlyView
          month={month}
          studentName={studentName}
          studentPossessive={studentPossessive}
        />
      )}
    </section>
  );
};

export default ProgressSectionV2;
