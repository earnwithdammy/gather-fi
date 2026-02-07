/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nigeria-green': '#008751',
        'naija-gold': '#F59E0B',
        'nigerian-blue': '#1E3A8A',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-nigeria': 'linear-gradient(135deg, #008751 0%, #F59E0B 100%)',
      },
    },
  },
  plugins: [],
}