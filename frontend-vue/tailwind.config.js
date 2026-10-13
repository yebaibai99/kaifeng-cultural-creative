/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /** 国内文创商城常见：米白底 + 朱砂红主色 */
        mall: {
          paper: "#faf8f5",
          card: "#ffffff",
          ink: "#1c1917",
          muted: "#78716c",
          line: "#e7e5e4",
          cinnabar: "#b91c1c",
          "cinnabar-hover": "#991b1b",
          gold: "#b45309"
        },
        admin: {
          50: "#e0e7ff",
          100: "#c7d2fe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          header: "#0f172a"
        },
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337"
        }
      }
    }
  },
  plugins: []
};

