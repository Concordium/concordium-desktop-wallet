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
if (targetNet) {
    userData += ` ${targetNet}`;
}

if (targetNet && !['stagenet', 'testnet'].includes(targetNet)) {
    throw new Error(
        `Unknown TARGET_NET. Only [stagenet, testnet] are allowed values. Given: ${targetNet}`
    );
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
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
        },
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
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, '.'),
        }),
    ],
};
