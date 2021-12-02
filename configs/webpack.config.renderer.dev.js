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
const { spawn, execSync } = require('child_process');
const { baseConfig, assetsConfig, stylesConfig } = require('./partials');
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
const { fromRoot } = require('./helpers/pathHelpers');

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
    CheckNodeEnv('development');
}

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
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

    target: ['web', 'electron-renderer'],

    entry: [
        'core-js',
        'regenerator-runtime/runtime',
        ...(process.env.PLAIN_HMR ? [] : ['react-hot-loader/patch']),
        `webpack-dev-server/client?http://localhost:${port}/`,
        'webpack/hot/only-dev-server',
        require.resolve('../app/index.tsx'),
    ],

    output: {
        publicPath: '/',
        filename: 'renderer.dev.js',
        library: {
            type: 'umd',
        },
    },

    experiments: {
        syncWebAssembly: true,
    },

    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom',
        },
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

        new webpack.ProvidePlugin({
            Buffer: ['buffer/', 'Buffer'],
        }),

        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         *
         * By default, use 'development' as NODE_ENV. This can be overriden with
         * 'staging', for example, by changing the ENV variables in the npm scripts
         */
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
        }),

        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
    ],

    node: {
        __dirname: false,
        __filename: false,
    },

    devServer: {
        port,
        compress: true,
        hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        static: {
            // directory: path.join(__dirname, 'dist'),
            // watch: true,
            publicPath: '/',
            // watchOptions: {
            //     aggregateTimeout: 300,
            //     ignored: /node_modules/,
            //     poll: 100,
            // },
        },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false,
        },
        onBeforeSetupMiddleware() {
            if (process.env.START_HOT) {
                console.log('Starting Main Process...');
                spawn('npm', ['run', 'start:dev'], {
                    shell: true,
                    env: process.env,
                    stdio: 'inherit',
                })
                    .on('close', (code) => process.exit(code))
                    .on('error', (spawnError) => console.error(spawnError));
            }
        },
    },
});
