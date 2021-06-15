/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Build config for electron renderer process
 */

const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const { baseConfig, assetsConfig, stylesConfig } = require('./partials');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const DeleteSourceMaps = require('../internals/scripts/DeleteSourceMaps');
const { fromRoot } = require('./helpers/pathHelpers');

CheckNodeEnv('production');
DeleteSourceMaps();

module.exports = merge(baseConfig, assetsConfig, stylesConfig(true), {
    devtool: process.env.DEBUG_PROD === 'true' ? 'source-map' : 'none',

    mode: 'production',

    target:
        process.env.E2E_BUILD || process.env.ERB_SECURE !== 'true'
            ? 'electron-renderer'
            : 'electron-preload',

    entry: [
        'core-js',
        'regenerator-runtime/runtime',
        fromRoot('./app/index.tsx'),
    ],

    output: {
        libraryTarget: 'var',
        path: fromRoot('./app/dist'),
        publicPath: './dist/',
        filename: 'renderer.prod.js',
    },

    optimization: {
        minimizer: process.env.E2E_BUILD
            ? []
            : [
                  new TerserPlugin({
                      parallel: true,
                      sourceMap: true,
                      cache: true,
                  }),
                  new OptimizeCSSAssetsPlugin({
                      cssProcessorOptions: {
                          map: {
                              inline: false,
                              annotation: true,
                          },
                      },
                  }),
              ],
    },

    plugins: [
        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         */
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
    ],
});
