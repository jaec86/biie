module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.vue',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      body: ['Montserrat', 'sans-serif'],
    },
    inset: {
      '0': '0',
      auto: 'auto',
      '1/2': '50%',
      full: '100%',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
