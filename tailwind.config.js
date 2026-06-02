/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stage: {
          950: "#080b14",
          900: "#111827",
          800: "#182237",
          700: "#253557"
        },
        accent: {
          gold: "#f7b500",
          cyan: "#42d6ff",
          coral: "#ff6b6b",
          lime: "#b7ff5a"
        }
      },
      fontFamily: {
        display: ["Impact", "Haettenschweiler", "'Arial Narrow Bold'", "sans-serif"],
        body: ["'Segoe UI'", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(255,255,255,0.08), 0 18px 60px rgba(8,11,20,0.55)"
      },
      backgroundImage: {
        "stage-radial":
          "radial-gradient(circle at top, rgba(66,214,255,0.16), transparent 34%), radial-gradient(circle at 80% 20%, rgba(247,181,0,0.18), transparent 26%), linear-gradient(160deg, #080b14 0%, #111827 55%, #182237 100%)"
      },
      keyframes: {
        pulseLead: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" }
        }
      },
      animation: {
        pulseLead: "pulseLead 0.6s ease-in-out 2"
      }
    }
  },
  plugins: []
};
