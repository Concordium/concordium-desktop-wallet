/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const pathToSvgAssets = path.resolve(__dirname, '../../app/assets/svg');

module.exports.pathToSvgAssets = pathToSvgAssets;
module.exports.config = {
    module: {
        rules: [
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
                include: pathToSvgAssets,
                use: ['@svgr/webpack'],
            },
            // Common Image Formats
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                use: 'url-loader',
            },
        ],
    },
};
