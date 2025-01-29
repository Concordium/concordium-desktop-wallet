/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const { baseConfig, assetsConfig, stylesConfig } = require('./partials');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const DeleteSourceMaps = require('../internals/scripts/DeleteSourceMaps');
const { fromRoot } = require('./helpers/pathHelpers');

CheckNodeEnv('development');
DeleteSourceMaps();

module.exports = merge(baseConfig, assetsConfig, stylesConfig(true), {
    devtool: 'inline-source-map',
    mode: 'development',
    target: 'electron-main',
    entry: [
        'core-js',
        'regenerator-runtime/runtime',
        fromRoot('./app/preload/preload.ts'),
    ],
    output: {
        path: fromRoot('./app'),
        filename: 'preload.dev.js',
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
        }),
    ],
});
