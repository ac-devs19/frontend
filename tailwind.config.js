const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    screens: {
      'max-sm': { max: '539px' },
      'max-md': { max: '719px' },
      'max-lg': { max: '959px' },
      'max-xl': { max: '1139px' },
      'max-2xl': { max: '1319px' },
    }
  },
  plugins: [],
});