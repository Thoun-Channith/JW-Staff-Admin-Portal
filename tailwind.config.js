/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-dark": "#003366",
        "primary-light": "#00AEEF",
        "neutral-grey": "#6C757D",
        "creamy-white": "#EDE8D0",
        //Dark mode colors
        "dark-bg": "#1a202c", // Dark background
        "dark-card": "#2d3748", // Darker card background
        "dark-text": "#edf2f7", // Light text for dark backgrounds
        "dark-border": "#4a5568", // Border color in dark mode
      },
    },
  },
  plugins: [],
};
