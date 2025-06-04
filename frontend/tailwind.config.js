/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'primary': '#5D12EB',
        'purpleStart':'#6E30DC',
        'purpleDown':'#5D12EB'
      }
    },
  },
  plugins: [],

}
