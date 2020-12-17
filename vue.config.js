module.exports = {
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-import'),
          require('tailwindcss'),
          require('autoprefixer'),
        ]
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/biie' : '/',
};