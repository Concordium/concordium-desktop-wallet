/* eslint-disable @typescript-eslint/no-var-requires */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { fromRoot } = require('../helpers/pathHelpers');

const STYLE_LOADER_NAME = 'style-loader';
const TYPINGS_LOADER_NAME = '@teamsupercell/typings-for-css-modules-loader';

const getLocalIdentName = (isProd) =>
    isProd ? '[hash:base64]' : '[name]__[local]--[hash:base64:5]';

const styleLoader = {
    loader: STYLE_LOADER_NAME,
};

const extractLoader = {
    loader: MiniCssExtractPlugin.loader,
};

const getOutputLoader = (isProd) => (isProd ? extractLoader : styleLoader);

module.exports = (isProd) => ({
    resolve: {
        // Followed instructions linked from official documentation: https://marekurbanowicz.medium.com/how-to-customize-fomantic-ui-with-less-and-webpack-applicable-to-semantic-ui-too-fbf98a74506c
        alias: {
            '../../theme.config$': fromRoot(
                './app/styles/semantic-ui/theme.config'
            ),
            '../semantic-ui/site': fromRoot('./app/styles/semantic-ui/site'),
        },
    },
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
                                includePaths: ['node_modules', 'app/styles'],
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
                    !isProd && {
                        loader: TYPINGS_LOADER_NAME,
                    },
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
                                includePaths: ['node_modules', 'app/styles'],
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
