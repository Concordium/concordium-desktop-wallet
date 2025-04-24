/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Build config for electron renderer process
 */

const webpack = require('webpack');
const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const { baseConfig, assetsConfig, stylesConfig } = require('./partials');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const DeleteSourceMaps = require('../internals/scripts/DeleteSourceMaps');
const { fromRoot } = require('./helpers/pathHelpers');

CheckNodeEnv('production');
DeleteSourceMaps();

const devtoolsConfig =
    process.env.DEBUG_PROD === 'true'
        ? {
              devtool: 'source-map',
          }
        : {};

module.exports = merge(baseConfig, assetsConfig, stylesConfig(true), {
    ...devtoolsConfig,
    mode: 'production',
    target: 'web',
    entry: [
        'core-js',
        'regenerator-runtime/runtime',
        fromRoot('./app/index.tsx'),
    ],

    output: {
        path: fromRoot('./app/dist'),
        publicPath: './dist/',
        filename: 'renderer.prod.js',
        library: {
            type: 'umd',
        },
    },

    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                sourceMap: true,
                cache: true,
            }),
            new CssMinimizerPlugin(),
        ],
    },

    experiments: {
        topLevelAwait: true,
        asyncWebAssembly: true,
    },

    resolve: {
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
        },
    },

    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
            DEBUG_PROD: false,
            E2E_BUILD: false,
        }),
        new BundleAnalyzerPlugin({
            analyzerMode:
                process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
            openAnalyzer: process.env.OPEN_ANALYZER === 'true',
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer/', 'Buffer'],
        }),
    ],
});
