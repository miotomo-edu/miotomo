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
        character: {
          tomo:   "#F2D47C",
          gramma: "#92B1D1",
          argoo:  "#E49C88",
          wordie: "#92949E",
          echo:   "#97BBA0",
        },
        userBubble:       "#F4F7F4",
        assistantBubble:  "#FAC304",
        assistantBubble20: "#FAC30433",
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
