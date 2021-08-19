/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const { build } = require('../package.json');
const { version, name } = require('../app/package.json');

let ext = 'deb';

if (process.platform === 'darwin') {
    ext = 'dmg';
} else if (process.platform === 'win32') {
    ext = 'exe';
}

const fileToHash = path.resolve(
    __dirname,
    `../${build.directories.output}/${name}-${version}.${ext}`
);
const outFile = `${fileToHash}.hash`;

const algorithm = 'sha256';

exec(`openssl dgst -${algorithm} ${fileToHash}`, (err, stdout, stderr) => {
    if (err) {
        console.error('exec error', err);
        return;
    }
    console.log(stdout);

    const hash = stdout.split('= ')[1];
    fs.writeFileSync(outFile, hash);

    console.log('Wrote hash successfully to file:', outFile);

    if (stderr) {
        console.error(stderr);
    }
});
