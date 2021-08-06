/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const { baseConfig, assetsConfig, stylesConfig } = require('./partials');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const DeleteSourceMaps = require('../internals/scripts/DeleteSourceMaps');
const { fromRoot } = require('./helpers/pathHelpers');

CheckNodeEnv('development');
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
        path: fromRoot('./app'),
        filename: 'preload.dev.js',
    },
});
