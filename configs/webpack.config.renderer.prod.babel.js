/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './partials/webpack.config.base';
import assetsConfig from './partials/webpack.config.assets';
import stylesConfig from './partials/webpack.config.styles';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

CheckNodeEnv('production');
DeleteSourceMaps();

export default merge(baseConfig, assetsConfig, stylesConfig(true), {
    devtool: process.env.DEBUG_PROD === 'true' ? 'source-map' : 'none',

    mode: 'production',

    target:
        process.env.E2E_BUILD || process.env.ERB_SECURE !== 'true'
            ? 'electron-renderer'
            : 'electron-preload',

    entry: [
        'core-js',
        'regenerator-runtime/runtime',
        path.join(__dirname, '..', 'app/index.tsx'),
    ],

    output: {
        path: path.join(__dirname, '..', 'app/dist'),
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
