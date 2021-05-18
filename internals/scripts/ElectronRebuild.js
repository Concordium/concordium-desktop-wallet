/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const remove = require('lodash');
const { dependencies } = require('../../app/package.json');

const nodeModulesPath = path.join(__dirname, '..', '..', 'app', 'node_modules');

// We should not rebuild the sqlcipher dependency (https://github.com/journeyapps/node-sqlcipher#usage-with-electron-forge--electron-rebuild)
const modules = Object.keys(dependencies || {}).filter((dep) => {
    return dep !== '@journeyapps/sqlcipher' && dep !== 'sqlite3';
});

if (
    Object.keys(dependencies || {}).length > 0 &&
    fs.existsSync(nodeModulesPath)
) {
    const electronRebuildCmd = `../node_modules/.bin/electron-rebuild --parallel --force --only ${modules.join(
        ','
    )} --module-dir .`;

    const cmd =
        process.platform === 'win32'
            ? electronRebuildCmd.replace(/\//g, '\\')
            : electronRebuildCmd;
    execSync(cmd, {
        cwd: path.join(__dirname, '..', '..', 'app'),
        stdio: 'inherit',
    });
}
