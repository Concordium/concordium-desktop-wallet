/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const chalk = require('chalk');
const { merge } = require('webpack-merge');
const { execSync } = require('child_process');
const { baseConfig, assetsConfig, stylesConfig } = require('./partials');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const { fromRoot } = require('./helpers/pathHelpers');

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
    CheckNodeEnv('development');
}

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist/`;
const dll = fromRoot('./dll');
const manifest = path.resolve(dll, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes(
    'webpack.config.renderer.dev.dll'
);

/**
 * Warn if the DLL is not built
 */
if (!requiredByDLLConfig && !(fs.existsSync(dll) && fs.existsSync(manifest))) {
    console.log(
        chalk.black.bgYellow.bold(
            'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"'
        )
    );
    execSync('yarn build-dll');
}

module.exports = merge(baseConfig, assetsConfig, stylesConfig(false), {
    devtool: 'inline-source-map',

    mode: 'development',

    target: 'web',

    entry: [
        'core-js',
        'regenerator-runtime/runtime',
        require.resolve('../app/index.tsx'),
    ],

    output: {
        publicPath,
        filename: 'renderer.dev.js',
        library: {
            type: 'umd',
        },
    },

    experiments: {
        asyncWebAssembly: true,
    },

    resolve: {
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
        },
    },
    optimization: {
        emitOnErrors: false,
    },
    plugins: [
        requiredByDLLConfig
            ? null
            : new webpack.DllReferencePlugin({
                  context: dll,
                  manifest: require(manifest),
                  sourceType: 'var',
              }),

        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
        }),

        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer/', 'Buffer'],
        }),
    ],

    node: {
        __dirname: false,
        __filename: false,
    },

    devServer: {
        port,
        compress: true,
        hot: false,
        headers: { 'Access-Control-Allow-Origin': '*' },
        static: {
            publicPath,
        },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false,
        },
    },
});
