/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Nunito", "sans-serif"],
      },
      colors: {
        gray: {
          25: "#FBFBFF",
          200: "#E1E1E5",
          350: "#BBBBBF",
          450: "#949498",
          600: "#616165",
          700: "#4E4E52",
          800: "#2C2C33",
          850: "#1A1A1F",
          900: "#101014",
          1000: "#0B0B0C",
        },
        blue: { link: "#79AFFA" },
        green: { spring: "#13EF93" },
        pink: { blush: "#F8CBC4" },
        cta: "#f25a57",
        tomo: "#F2D47C",
        brand: {
          primary: "#FAC304",
          dark:    "#1A1A1F",
          danger:  "#f25a57",
        },
        surface: {
          base:   "#FFFFFF",
          warm:   "#F4ECDF",
          circle: "#EFE6DA",
          dark:   "#101014",
        },
        userBubble:        "#C492F1",
        assistantBubble:   "#FAC304",
        assistantBubble20: "#FAC30433",
      },
      boxShadow: {
        xs:             "0 1px 3px rgba(0,0,0,0.08)",
        card:           "0 4px 12px rgba(0,0,0,0.10)",
        elevated:       "0 8px 24px rgba(0,0,0,0.14)",
        hero:           "0 14px 40px rgba(0,0,0,0.22)",
        stage:          "0 28px 90px rgba(25,26,20,0.18)",
        "glow-gold":    "0 0 0 6px rgba(250,195,4,0.22)",
        "glow-mic":     "0 0 16px 4px #f78ad7, 0 2px 8px rgba(0,0,0,0.08)",
        "inset-highlight": "inset 0 1px 0 rgba(255,255,255,0.45)",
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
