/* eslint-disable @typescript-eslint/no-var-requires */
// Check if the renderer and main bundles are built
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

const mainPath = path.join(__dirname, '..', '..', 'app', 'main.prod.js');
const rendererPath = path.join(
    __dirname,
    '..',
    '..',
    'app',
    'dist',
    'renderer.prod.js'
);

if (!fs.existsSync(mainPath)) {
    throw new Error(
        chalk.whiteBright.bgRed.bold(
            'The main process is not built yet. Build it by running "yarn build-main"'
        )
    );
}

if (!fs.existsSync(rendererPath)) {
    throw new Error(
        chalk.whiteBright.bgRed.bold(
            'The renderer process is not built yet. Build it by running "yarn build-renderer"'
        )
    );
}
