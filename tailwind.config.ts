import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rosso: {
          50: "#fff1f1",
          600: "#d71920",
          700: "#b8141a"
        },
        ink: "#191716"
      }
    }
  },
  plugins: []
};

export default config;
