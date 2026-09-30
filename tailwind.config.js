/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        naval: {
          50: "#eef4fb",
          100: "#d6e4f5",
          600: "#1a4d8f",
          700: "#153f75",
          800: "#0f2d54",
          900: "#0a2038",
        },
      },
    },
  },
  plugins: [],
};
