module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === 'publish',
    content: ['./src/**/*.{js,jsx,ts,tsx}']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      scale: {
        '-1': '-1'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
