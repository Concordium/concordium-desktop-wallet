/* eslint-disable @typescript-eslint/no-var-requires */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const getLocalIdentName = (isProd) =>
    isProd ? '[hash:base64]' : '[name]__[local]--[hash:base64:5]';

const styleLoader = {
    loader: 'style-loader',
};

const extractLoader = {
    loader: MiniCssExtractPlugin.loader,
};

const getOutputLoader = (isProd) => (isProd ? extractLoader : styleLoader);

module.exports = (isProd) => ({
    module: {
        rules: [
            // Extract all .global.css to style.css as is
            {
                test: /\.global\.css$/,
                use: [
                    getOutputLoader(isProd),
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            // Pipe other styles through css modules and append to style.css
            {
                test: /\.module\.css$/,
                use: [
                    getOutputLoader(isProd),
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: getLocalIdentName(isProd),
                            },
                            sourceMap: true,
                        },
                    },
                ],
            },
            // Add SASS support  - compile all .global.scss files and pipe it to style.css
            {
                test: /\.global\.(scss|sass)$/,
                use: [
                    getOutputLoader(isProd),
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            sassOptions: {
                                loadPaths: ['node_modules', 'app/styles'],
                            },
                        },
                    },
                ],
            },
            // Add SASS support  - compile all .module.scss files and pipe it to style.css
            {
                test: /\.module\.(scss|sass)$/,
                use: [
                    getOutputLoader(isProd),
                    '@teamsupercell/typings-for-css-modules-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: getLocalIdentName(isProd),
                            },
                            importLoaders: 1,
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            sassOptions: {
                                loadPaths: ['node_modules', 'app/styles'],
                            },
                        },
                    },
                ].filter((u) => !!u),
            },
        ],
    },
    plugins: [
        isProd &&
            new MiniCssExtractPlugin({
                filename: 'style.css',
            }),
    ].filter((p) => !!p),
});
