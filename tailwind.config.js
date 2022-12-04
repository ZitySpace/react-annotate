module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/container-queries')],
  corePlugins: {
    preflight: false,
  },
  prefix: 'ra-',
};
