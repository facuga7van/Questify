/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./index.html",
      "./src/**/*.{html,svelte,js,ts,tsx,jsx}",
      "./electron/**/*.{html,js,ts,,tsx,jsx}"
  ],
  theme: {
      extend: {},
  },
  plugins: [],
}