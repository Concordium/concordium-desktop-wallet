/* eslint-disable promise/always-return */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const https = require('https');
const { promisify } = require('util');

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
    .option('skiprv', {
        description:
            'Skips verification using remote public key. U seful if the used private key doesn\t match the current remote public key',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h');

const { file, key: publicKeyPath, verify: verifyKeyPath, skiprv } = argv;

const hashOutFile = `${file}.hash`;
const algorithm = 'sha256';

// Produce file checksum
exec(`openssl dgst -${algorithm} ${file}`, (err, stdout) => {
    if (err) {
        console.error('exec error', err);
        return;
    }

    const hash = stdout.split('= ')[1];
    fs.writeFileSync(hashOutFile, hash);

    console.log('Wrote hash successfully to file:', hashOutFile);
});

const sigOutFile = `${file}.sig`;

/**
 * Function to verify the newly created signature against public key
 *
 * @param {string} pubKeyPath public key matching private key given in argv.key (--key).
 */
async function verify(pubKeyPath) {
    const { stdout } = await promisify(exec)(
        `openssl dgst -${algorithm} -verify ${pubKeyPath} -signature ${sigOutFile} ${file}`
    );

    console.log(stdout);
}

const remotePubKeyUrl =
    'https://gist.githubusercontent.com/soerenbf/089046aa95b7708cae1ec6c33dacf73d/raw/04b4da1f5e392ae2ff3e1aada5113b193eecb165/cdw-pubkey-test.pem';

function getRemotePubKey() {
    return new Promise((resolve, reject) => {
        const req = https.get(remotePubKeyUrl, (res) => {
            let acc = '';
            res.on('data', (d) => {
                acc += d.toString();
            });

            res.on('end', () => {
                resolve(acc);
            });
        });

        req.on('error', reject);
        req.end();
    });
}
const tempDir = path.resolve(__dirname, '../temp');

function getTempFile(filename) {
    return path.join(tempDir, filename);
}

function writeTempFile(content, filename) {
    try {
        fs.mkdirSync(tempDir);
    } catch {
        // Do nothing...
    } finally {
        fs.writeFileSync(getTempFile(filename), content);
    }
}

function removeTempFile(filename) {
    fs.rmSync(getTempFile(filename));
    fs.rmdirSync(tempDir);
}

/**
 * Execute async function with temporary file
 *
 * @param {*} content Content for temp file.
 * @param {*} filename Optional filepath. Defaults to timestamp.
 * @returns A function, that takes a callback passing in the filename used. This function must return a promise.
 *
 * @example
 * const execute = executeWithTempFile(someContent);
 * await execute((file) => doSomethingWithFilePath(file));
 */
const executeWithTempFile = (
    content,
    filename = Date.now().toString()
) => async (cb) => {
    writeTempFile(content, filename);
    await cb(getTempFile(filename));
    removeTempFile(filename);
};

async function verifyRemote() {
    console.log('\nRemote verification:');

    try {
        const content = await getRemotePubKey();
        await executeWithTempFile(content)((p) => verify(p));
    } catch (err) {
        console.error(err);
    }
}

/**
 * Produce signature of file checksum.
 *
 * The signature can be verified by running the following command:
 * openssl dgst -<hash-algorithm> -verify <pubkey-file> -signature <signature-file> <file>
 * (e.g. openssl dgst -sha256 -verify ./Downloads/concordium-desktop-wallet.pem -signature ./Downloads/concordium-desktop-wallet-1.0.0.dmg.hash.sig ./Downloads/concordium-desktop-wallet-1.0.0.dmg)
 */
exec(
    `openssl dgst -${algorithm} -sign ${publicKeyPath} -out ${sigOutFile} ${file}`,
    () => {
        console.log('Wrote sig successfully to file:', sigOutFile);

        if (verifyKeyPath) {
            verify(verifyKeyPath);
        } else if (!skiprv) {
            verifyRemote();
        }
    }
);
