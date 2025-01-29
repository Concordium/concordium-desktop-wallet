/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Base webpack config used across other specific configs
 */

const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const { dependencies: externals } = require('../../app/package.json');
const CheckTargetNet = require('../../internals/scripts/CheckTargetNet');

CheckTargetNet();

const targetNet = process.env.TARGET_NET;

let userData = 'Concordium Wallet';
if (targetNet && targetNet !== 'mainnet') {
    userData += ` ${targetNet}`;
}

const extensions = ['.js', '.jsx', '.json', '.ts', '.tsx'];

module.exports = {
    externals: [...Object.keys(externals || {})],

    module: {
        rules: [
            {
                test: /\.worker\.ts?$/,
                use: [
                    {
                        loader: 'worker-loader',
                        options: {
                            publicPath: './',
                        },
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                include: /app/,
                use: 'ts-loader',
            },
        ],
    },

    output: {
        path: path.join(__dirname, '..', 'app'),
        // https://github.com/webpack/webpack/issues/1114
        library: {
            type: 'commonjs2',
        },
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
        mainFields: ['module', 'main', 'browser'],
        alias: {
            // Resolve bundler-specific wasm entrypoints.
            '@concordium/rust-bindings': '@concordium/rust-bindings/bundler',
        },
    },

    experiments: {
        asyncWebAssembly: true,
    },

    optimization: {
        moduleIds: 'named',
        emitOnErrors: true,
    },

    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
            TARGET_NET: 'mainnet',
            USER_DATA: userData,
            LEDGER_EMULATOR_URL: '',
            DEBUG_PROD: false,
            START_MINIMIZED: false,
            E2E_BUILD: false,
        }),
        new webpack.NormalModuleReplacementPlugin(
            /\.\.\/migrations/,
            '../util/noop.js'
        ),
        new webpack.NormalModuleReplacementPlugin(
            /\.\.\/pkg\/node_sdk_helpers/,
            path.resolve(__dirname, '../..', 'internals/mocks/empty.js')
        ),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, '.'),
        }),
    ],
};
