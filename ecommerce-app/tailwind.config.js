module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',  // สำหรับ App Router
    './pages/**/*.{js,ts,jsx,tsx}', // สำหรับโฟลเดอร์ pages
    './components/**/*.{js,ts,jsx,tsx}', // สำหรับ component ต่าง ๆ
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake'], // กำหนดธีม DaisyUI
  },
}
