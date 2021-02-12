/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const { merge } = require('webpack-merge');
const { dependencies: externals } = require('./app/package.json');

const common = {
    externals: [...Object.keys(externals || {})],
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
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
                loader: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.wasm'],
    },
};

module.exports = [
    merge(common, {
        target: 'electron-renderer',
        entry: './app/index.tsx',
        output: {
            filename: 'bundle.js',
        },
        module: {
            rules: [
                // SASS support - compile all .global.scss files and pipe it to style.css
                {
                    test: /\.global\.(scss|sass)$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                sassOptions: {
                                    includePaths: [
                                        'node_modules',
                                        'app/styles',
                                    ],
                                },
                            },
                        },
                    ],
                },
                // SASS support - compile all module.scss files and pipe it to style.css
                {
                    test: /\.module\.(scss|sass)$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader:
                                '@teamsupercell/typings-for-css-modules-loader',
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    localIdentName:
                                        '[name]__[local]__[hash:base64:5]',
                                },
                                sourceMap: true,
                                importLoaders: 1,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                sassOptions: {
                                    includePaths: [
                                        'node_modules',
                                        'app/styles',
                                    ],
                                },
                            },
                        },
                    ],
                },
                // WOFF Font
                {
                    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'application/font-woff',
                        },
                    },
                },
                // WOFF2 Font
                {
                    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'application/font-woff',
                        },
                    },
                },
                // TTF Font
                {
                    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'application/octet-stream',
                        },
                    },
                },
                // EOT Font
                {
                    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                    use: 'file-loader',
                },
                // SVG Font
                {
                    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'image/svg+xml',
                        },
                    },
                },
                // Common Image Formats
                {
                    test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                    use: 'url-loader',
                },
            ],
        },
        plugins: [
            //   new HtmlWebpackPlugin({ template: path.resolve(__dirname, "./app/app.html") }),
            new WasmPackPlugin({
                crateDirectory: path.resolve(__dirname, '.'),
            }),
        ],
    }),
    merge(common, {
        target: 'electron-main',
        entry: './app/main.dev.ts',
        output: {
            filename: 'electron.js',
        },
    }),
];
