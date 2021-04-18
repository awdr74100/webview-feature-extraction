/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const purgecss = require('@fullhuman/postcss-purgecss');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    require('autoprefixer'),
    isProd &&
      purgecss({
        content: [
          './*.html',
          './src/**/*.vue',
          './node_modules/vue-loading-overlay/dist/vue-loading.js', // vue plugin
        ],
        defaultExtractor(content) {
          const contentWithoutStyleBlocks = content.replace(
            /<style[^]+?<\/style>/gi,
            '',
          );
          return (
            contentWithoutStyleBlocks.match(
              /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g,
            ) || []
          );
        },
        safelist: [
          /-(leave|enter|appear)(|-(to|from|active))$/,
          /^(?!(|.*?:)cursor-move).+-move$/,
          /^router-link(|-exact)-active$/,
          /data-v-.*/,
        ],
      }),
  ],
};
