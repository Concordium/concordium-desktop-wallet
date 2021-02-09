/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Builds the DLL for development electron renderer process
 */

const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./partials/webpack.config.base');
const { dependencies } = require('../package.json');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const rendererDevConfig = require('./webpack.config.renderer.dev');

CheckNodeEnv('development');

const dist = path.join(__dirname, '..', 'dll');
const excludeDeps = ['semantic-ui-less'];

module.exports = merge(baseConfig, {
    context: path.join(__dirname, '..'),

    devtool: 'eval',

    mode: 'development',

    target: 'electron-renderer',

    externals: ['fsevents', 'crypto-browserify'],

    /**
     * Use `module` from `webpack.config.renderer.dev.js`
     */
    module: rendererDevConfig.module,

    entry: {
        renderer: Object.keys(dependencies || {}).filter(
            (d) => !excludeDeps.includes(d)
        ),
    },

    output: {
        library: 'renderer',
        path: dist,
        filename: '[name].dev.dll.js',
        libraryTarget: 'var',
    },

    plugins: [
        new webpack.DllPlugin({
            path: path.join(dist, '[name].json'),
            name: '[name]',
        }),

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
            NODE_ENV: 'development',
        }),

        new webpack.LoaderOptionsPlugin({
            debug: true,
            options: {
                context: path.join(__dirname, '..', 'app'),
                output: {
                    path: path.join(__dirname, '..', 'dll'),
                },
            },
        }),
    ],
});
