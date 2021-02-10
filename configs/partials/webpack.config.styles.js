/* eslint-disable @typescript-eslint/no-var-requires */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { fromRoot } = require('../helpers/pathHelpers');

const STYLE_LOADER_NAME = 'style-loader';
const TYPINGS_LOADER_NAME = '@teamsupercell/typings-for-css-modules-loader';

const config = {
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
                    {
                        loader: STYLE_LOADER_NAME,
                    },
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
                    {
                        loader: STYLE_LOADER_NAME,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName:
                                    '[name]__[local]__[hash:base64:5]',
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
                    {
                        loader: STYLE_LOADER_NAME,
                    },
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
                    {
                        loader: STYLE_LOADER_NAME,
                    },
                    {
                        loader: TYPINGS_LOADER_NAME,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName:
                                    '[name]__[local]__[hash:base64:5]',
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
                ],
            },
            // Less is used solely for compiling the semantic-ui theme.
            {
                test: /\.less$/,
                use: [
                    {
                        loader: STYLE_LOADER_NAME,
                    },
                    'css-loader',
                    'less-loader',
                ],
            },
        ],
    },
};

const extractLoader = {
    loader: MiniCssExtractPlugin.loader,
};

function mapStyleToExtractLoader(l) {
    if (l.loader !== STYLE_LOADER_NAME) {
        return l;
    }

    return extractLoader;
}

function removeModuleTypingsLoader(useConfig) {
    return useConfig
        .map((l) => {
            if (l !== TYPINGS_LOADER_NAME) {
                return l;
            }

            return undefined;
        })
        .filter((l) => !!l);
}

const prodConfig = {
    ...config,
    module: {
        ...config.module,
        rules: config.module.rules.map((r) => ({
            ...r,
            use: removeModuleTypingsLoader(r.use.map(mapStyleToExtractLoader)),
        })),
    },
    plugins: [
        ...(config.plugins || []),
        new MiniCssExtractPlugin({
            filename: 'style.css',
        }),
    ],
};

module.exports = (isProd) => (!isProd ? config : prodConfig);
