/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        line: "#d1d5db",
        surface: "#f8fafc"
      }
    }
  },
  plugins: []
};
