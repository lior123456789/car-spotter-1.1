import type { Config } from "tailwindcss";
const flattenColorPalette = require("tailwindcss/lib/util/flattenColorPalette").default;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        spotter: {
          // Repurposed names kept for compatibility — values now cyan + violet
          // Premium electric palette to stand apart from competitors.
          orange: "#22D3EE",   // cyan-400 (was warm orange)
          red:    "#A855F7",   // violet-500 (was hot red)
          ink:    "#05050B",   // deeper black for shader contrast
          panel:  "#0E0E18",   // panel slightly blue-shifted
          line:   "#1A1A28",
          mute:   "#8A8A95",
          // New semantic tokens (use these in new code)
          cyan:   "#22D3EE",
          violet: "#A855F7",
          accent: "#7DD3FC",   // sky-300 for hover glows
          glow:   "#06B6D4",   // cyan-500 for strong accents
        },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      animation: {
        aurora:    "aurora 60s linear infinite",
        spotlight: "spotlight 2s ease 0.5s 1 forwards",
        shimmer:   "shimmer 2.5s linear infinite",
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to:   { backgroundPosition: "350% 50%, 350% 50%" },
        },
        spotlight: {
          "0%":   { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%, -40%) scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to:   { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
};
export default config;

function addVariablesForColors({ addBase, theme }: any) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([k, v]) => [`--${k}`, v])
  );
  addBase({ ":root": newVars });
}
