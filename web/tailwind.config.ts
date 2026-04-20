import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f4efe4",
        ink: "#1f2933",
        panel: "#fffaf0",
        panelStrong: "#f7f1e3",
        line: "#d3c6ac",
        flood: "#2c6fb7",
        wildfire: "#d85c2b",
        health: "#8e3b8a",
        storm: "#4a7c59",
        other: "#6b7280",
        needsIdentified: "#2563eb",
        pingSent: "#eab308",
        responseConfirmed: "#16a34a",
        gapFlagged: "#dc2626",
        muted: "#6b7280",
      },
      boxShadow: {
        card: "0 18px 45px rgba(31, 41, 51, 0.08)",
      },
      animation: {
        drift: "drift 14s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.6s ease-in-out infinite",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
