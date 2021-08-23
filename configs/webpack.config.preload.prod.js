/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const { baseConfig, assetsConfig, stylesConfig } = require('./partials');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const DeleteSourceMaps = require('../internals/scripts/DeleteSourceMaps');
const { fromRoot } = require('./helpers/pathHelpers');

CheckNodeEnv('production');
DeleteSourceMaps();

module.exports = merge(baseConfig, assetsConfig, stylesConfig(true), {
    devtool: 'none',
    mode: 'production',
    target: 'electron-main',
    entry: [
        'core-js',
        'regenerator-runtime/runtime',
        fromRoot('./app/preload/preload.ts'),
    ],
    output: {
        path: fromRoot('./app/dist'),
        publicPath: './dist/',
        filename: 'preload.prod.js',
    },
});
