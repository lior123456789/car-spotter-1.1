import type { Config } from "tailwindcss";
const flattenColorPalette = require("tailwindcss/lib/util/flattenColorPalette").default;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        spotter: {
          orange: "#FF7A2E",
          red:    "#FF3D5A",
          ink:    "#0A0A0F",
          panel:  "#13131A",
          line:   "#1F1F28",
          mute:   "#8A8A95",
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
