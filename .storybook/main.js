const { default: TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const { baseConfig, assetsConfig, stylesConfig } = require('../configs/partials');
const { pathToSvgAssets } = require('../configs/partials/webpack.config.assets');

const extensions = ['.js', '.jsx', '.json', '.ts', '.tsx'];

module.exports = {
  "stories": [
    "../app/**/*.stories.@(js|jsx|ts|tsx|mdx)",
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

    config.resolve.plugins = [...(config.resolve.plugins || []), new TsconfigPathsPlugin({ extensions })];

    const tsRule = baseConfig.module.rules.find(r => r.test.test('.ts'));
    tsRule.use[1].options = {
        configFile: path.resolve(__dirname, '../tsconfig.sb.json'),
    };

    config.module.rules = [
      ...(config.module.rules || []),
      ...baseConfig.module.rules,
      ...stylesConfig(false).module.rules,
      ...assetsConfig.module.rules
    ];

    return config;
  },
}
