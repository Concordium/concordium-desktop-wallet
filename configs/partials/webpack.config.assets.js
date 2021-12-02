/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const pathToSvgAssets = path.resolve(__dirname, '../../resources/svg');

module.exports.pathToSvgAssets = pathToSvgAssets;
module.exports.config = {
    module: {
        rules: [
            // WOFF Font
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                exclude: /node_modules/,
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
                exclude: /node_modules/,
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
                exclude: /node_modules/,
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
                exclude: /node_modules/,
                use: 'file-loader',
            },
            // SVG Font
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                exclude: [pathToSvgAssets, /node_modules/],
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'image/svg+xml',
                    },
                },
            },
            // SVG Inline
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                include: pathToSvgAssets,
                exclude: /node_modules/,
                use: ['@svgr/webpack'],
            },
            // Common Image Formats
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                exclude: /node_modules/,
                use: 'url-loader',
            },
        ],
    },
};
