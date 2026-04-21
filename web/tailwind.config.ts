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
        ink: "#1E1724",
        panel: "#2C2230",
        panelSoft: "#3A2E39",
        elevated: "#453748",
        line: "#4E3E50",
        lineSubtle: "#3A2E39",
        primary: "#2F8C96",
        primaryHover: "#39A8B5",
        primarySubtle: "#1F5D64",
        needsIdentified: "#4D8FB7",
        pingSent: "#C39A33",
        responseConfirmed: "#2FA26D",
        gapFlagged: "#C15B63",
        flood: "#4D8FB7",
        wildfire: "#C5723A",
        health: "#9B7CC2",
        storm: "#5C92A8",
        other: "#8D8190",
        success: "#22C55E",
        danger: "#EF4444",
        textPrimary: "#EDE8ED",
        textSecondary: "#B7AEB7",
        textMuted: "#958A95",
      },
      boxShadow: {
        panel: "none",
      },
      animation: {
        pulseMarker: "pulse 2s ease-in-out infinite",
        flashCard: "flash 2.2s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
