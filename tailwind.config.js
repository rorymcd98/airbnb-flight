/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./extension-frontend/dev-view/dev.html",
    "**/*.{js,jsx,ts,tsx}",
    "./extension-frontend/flight-offers-chart/components/FlightOffersChart.tsx"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

