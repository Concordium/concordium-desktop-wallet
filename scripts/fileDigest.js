/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');

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

const { argv } = yargs
    .option('key', {
        alias: 'k',
        description: 'File containing private key',
        type: 'string',
        demandOption: true,
    })
    .option('file', {
        alias: 'f',
        description: 'File to perform digest on. Defaults to ',
        type: 'string',
        default: fileToHash,
    })
    .help()
    .alias('help', 'h');

const hashOutFile = `${argv.file}.hash`;
const algorithm = 'sha256';

// Produce sha256 checksum
exec(`openssl dgst -${algorithm} ${argv.file}`, (err, stdout) => {
    if (err) {
        console.error('exec error', err);
        return;
    }

    const hash = stdout.split('= ')[1];
    fs.writeFileSync(hashOutFile, hash);

    console.log('Wrote hash successfully to file:', hashOutFile);
});

const sigOutFile = `${argv.file}.sig`;

// Produce signature
exec(
    `openssl dgst -${algorithm} -sign ${argv.key} -out ${sigOutFile} ${argv.file}`,
    () => {
        console.log('Wrote sig successfully to file:', sigOutFile);
    }
);
