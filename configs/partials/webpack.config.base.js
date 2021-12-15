/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Base webpack config used across other specific configs
 */

const path = require('path');
const webpack = require('webpack');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { dependencies: externals } = require('../../app/package.json');
const CheckTargetNet = require('../../internals/scripts/CheckTargetNet');

CheckTargetNet();

const extensions = ['.js', '.jsx', '.json', '.ts', '.tsx'];

module.exports = {
    externals: [...Object.keys(externals || {})],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                include: /app/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                '@babel/plugin-proposal-optional-chaining',
                                '@babel/plugin-proposal-nullish-coalescing-operator',
                            ],
                        },
                    },
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },

    output: {
        path: path.join(__dirname, '..', 'app'),
        // https://github.com/webpack/webpack/issues/1114
        library: {
            type: 'commonjs2',
        },
        webassemblyModuleFilename: 'crypto.wasm',
    },

    /**
     * Determine the array of extensions that should be used to resolve modules.
     */
    resolve: {
        extensions,
        modules: [path.join(__dirname, '..', 'app'), 'node_modules'],
        plugins: [
            new TsconfigPathsPlugin({
                extensions,
            }),
        ],
        fallback: {
            assert: require.resolve('assert'),
            buffer: require.resolve('buffer'),
            console: require.resolve('console-browserify'),
            constants: require.resolve('constants-browserify'),
            crypto: require.resolve('crypto-browserify'),
            domain: require.resolve('domain-browser'),
            events: require.resolve('events'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify/browser'),
            path: require.resolve('path-browserify'),
            punycode: require.resolve('punycode'),
            // process: require.resolve('process/browser'),
            querystring: require.resolve('querystring-es3'),
            stream: require.resolve('stream-browserify'),
            string_decoder: require.resolve('string_decoder'),
            sys: require.resolve('util'),
            timers: require.resolve('timers-browserify'),
            tty: require.resolve('tty-browserify'),
            url: require.resolve('url'),
            util: require.resolve('util'),
            vm: require.resolve('vm-browserify'),
            zlib: require.resolve('browserify-zlib'),
        },
    },

    optimization: {
        moduleIds: 'named',
        emitOnErrors: true,
    },

    plugins: [
        new webpack.EnvironmentPlugin({
            TARGET_NET: 'mainnet',
            LEDGER_EMULATOR_URL: '',
            DEBUG_PROD: false,
            START_MINIMIZED: false,
            E2E_BUILD: false,
        }),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, '.'),
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer/', 'Buffer'],
        }),
        new webpack.NormalModuleReplacementPlugin(
            /\.\.\/migrations/,
            '../util/noop.js'
        ),
        new webpack.NormalModuleReplacementPlugin(
            /\.\.\/pkg\/node_sdk_helpers/,
            path.resolve(__dirname, '../..', 'internals/mocks/empty.js')
        ),
    ],
};
