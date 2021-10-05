/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Base webpack config used across other specific configs
 */

const path = require('path');
const webpack = require('webpack');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { dependencies: externals } = require('../../app/package.json');

const extensions = ['.js', '.jsx', '.json', '.ts', '.tsx'];

const targetNet = process.env.TARGET_NET;

let userData = process.env.npm_package_userData;
if (targetNet) {
    userData += ` ${targetNet}`;
}

if (targetNet && !['stagenet', 'testnet'].includes(targetNet)) {
    throw new Error(
        `Unknown TARGET_NET. Only [stagenet, testnet] are allowed values. Given: ${targetNet}`
    );
}

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
        libraryTarget: 'commonjs2',
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
    },

    optimization: {
        namedModules: true,
        noEmitOnErrors: false,
    },

    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
            TARGET_NET: '',
            USER_DATA: userData,
            LEDGER_EMULATOR_URL: '',
        }),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, '.'),
        }),
        new webpack.NormalModuleReplacementPlugin(
            /\.\.\/migrations/,
            '../util/noop.js'
        ),
    ],
};
