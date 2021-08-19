/* eslint-disable no-console */
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

const defaultFile = path.resolve(
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
        description: 'File to perform digest on',
        type: 'string',
        default: defaultFile,
    })
    .option('verify', {
        alias: 'v',
        description: 'Verify with specified public key',
        type: 'string',
    })
    .help()
    .alias('help', 'h');

const fileToHash = argv.file;

const hashOutFile = `${fileToHash}.hash`;
const algorithm = 'sha256';

// Produce file checksum
exec(`openssl dgst -${algorithm} ${fileToHash}`, (err, stdout) => {
    if (err) {
        console.error('exec error', err);
        return;
    }

    const hash = stdout.split('= ')[1];
    fs.writeFileSync(hashOutFile, hash);

    console.log('Wrote hash successfully to file:', hashOutFile);
});

const sigOutFile = `${fileToHash}.sig`;

/**
 * Function to verify the newly created signature against public key
 *
 * @param {string} pubKeyPath public key matching private key given in argv.key (--key).
 */
function verify(pubKeyPath) {
    exec(
        `openssl dgst -${algorithm} -verify ${pubKeyPath} -signature ${sigOutFile} ${fileToHash}`,
        (_, stdout) => console.log(stdout)
    );
}

/**
 * Produce signature of file checksum.
 *
 * The signature can be verified by running the following command:
 * openssl dgst -<hash-algorithm> -verify <pubkey-file> -signature <signature-file> <file>
 * (e.g. openssl dgst -sha256 -verify ./Downloads/concordium-desktop-wallet.pem -signature ./Downloads/concordium-desktop-wallet-1.0.0.dmg.hash.sig ./Downloads/concordium-desktop-wallet-1.0.0.dmg)
 */
exec(
    `openssl dgst -${algorithm} -sign ${argv.key} -out ${sigOutFile} ${fileToHash}`,
    () => {
        console.log('Wrote sig successfully to file:', sigOutFile);

        if (argv.verify) {
            verify(argv.verify);
        }
    }
);
