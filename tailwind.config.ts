import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F1",
        paper: "#FFFFFF",
        sand: "#F3E9DC",
        latte: "#EADBC7",
        clay: {
          200: "#E7D3BB",
          300: "#D8BD9D",
          400: "#C9A27E",
          500: "#B5895E",
          600: "#9A6F49",
        },
        cocoa: {
          600: "#7E5C40",
          700: "#5F4632",
          800: "#43321F",
        },
        ink: "#2C211A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 60px -28px rgba(67, 50, 31, 0.28)",
        card: "0 18px 40px -24px rgba(67, 50, 31, 0.35)",
        glow: "0 0 0 1px rgba(201,162,126,0.25), 0 30px 80px -40px rgba(95,70,50,0.45)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
