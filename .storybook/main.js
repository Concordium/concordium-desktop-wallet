const { baseConfig, assetsConfig, stylesConfig } = require('../configs/partials');
const { pathToSvgAssets } = require('../configs/partials/webpack.config.assets');

module.exports = {
  "stories": [
    "../app/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: async (config) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    const fileLoaderRule = config.module.rules.find(rule => rule.test.test('.svg'));
    fileLoaderRule.exclude = pathToSvgAssets;

    config.module.rules = [
      ...(config.module.rules || []),
      ...baseConfig.module.rules,
      ...stylesConfig(false).module.rules,
      ...assetsConfig.module.rules
    ];

    return config;
  },
}