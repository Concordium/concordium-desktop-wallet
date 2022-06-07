/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Webpack config for production electron main process
 */

const webpack = require('webpack');
const { merge } = require('webpack-merge');
const { baseConfig } = require('./partials');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const { fromRoot } = require('./helpers/pathHelpers');

if (process.env.NODE_ENV === 'production') {
    CheckNodeEnv('development');
}

module.exports = merge(baseConfig, {
    devtool: 'inline-source-map',

    mode: 'development',

    target: 'electron-main',

    entry: './app/main.ts',

    output: {
        path: fromRoot('./app'),
        filename: 'main.dev.js',
    },

    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
            LEDGER_EMULATOR_URL: process.env.LEDGER_EMULATOR_URL
                ? process.env.LEDGER_EMULATOR_URL
                : '',
        }),
    ],

    /**
     * Disables webpack processing of __dirname and __filename.
     * If you run the bundle in node.js it falls back to these values of node.js.
     * https://github.com/webpack/webpack/issues/2010
     */
    node: {
        __dirname: false,
        __filename: false,
    },
});
