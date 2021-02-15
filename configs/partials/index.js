/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('./webpack.config.base');
const { config: assetsConfig } = require('./webpack.config.assets');
const stylesConfig = require('./webpack.config.styles');

module.exports = {
    baseConfig,
    assetsConfig,
    stylesConfig,
};
