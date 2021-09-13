/* eslint-disable promise/always-return */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const https = require('https');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const { build } = require('../package.json');
const app = require('../app/package.json');
const { publicKeyUrl } = require('../app/constants/verification.json');

/**
 * @description
 * This CLI relies on openssl under the hood to generate and verify hashes and signatures.
 * As such, running the script in a shell that doesn't have access to openssl CLI will fail.
 *
 * @example
 * $ node ./scripts/fileDigest.js -k <path-to-private-key> [-f <path-to-file] [--verify <path-to-public-key>] [--skiprv] \
 *      [--win] [--mac] [--linux] [--all] [--dir <path-to-dir>] [--appVersion <app-version-number>]
 */

// Configuration of command line arguments
const { argv } = yargs
    .option('key', {
        alias: 'k',
        description: 'File containing private key',
        type: 'string',
        demandOption: true,
    })
    .option('file', {
        alias: 'f',
        description: '(Optional) File to perform digest on.',
        type: 'string',
    })
    .option('dir', {
        description: '(Optional) Directory to find for files in.',
        type: 'string',
        default: path.resolve(__dirname, `../${build.directories.output}`),
    })
    .option('appVersion', {
        description: '(Optional) App version to use for finding files.',
        type: 'string',
        default: app.version,
    })
    .option('verify', {
        description: '(Optional) Verify with specified public key',
        type: 'string',
    })
    .option('skiprv', {
        description:
            "(Optional) Skips verification using remote public key. Useful if the used private key doesn't match the current remote public key",
        type: 'boolean',
    })
    .option('win', {
        description: '(Optional) Include Windows targets as digest input',
        type: 'boolean',
    })
    .option('mac', {
        description: '(Optional) Include MacOS targets as digest input',
        type: 'boolean',
    })
    .option('linux', {
        description: '(Optional) Include Linux targets as digest input',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h');

const {
    file: inputFile,
    key: privateKeyPath,
    verify: verifyKeyPath,
    skiprv,
    win,
    mac,
    linux,
    dir,
    appVersion,
} = argv;

const hashAlgorithm = 'sha256';

// Produce file checksum
async function writeChecksum(file) {
    const { stdout } = await exec(`openssl dgst -${hashAlgorithm} ${file}`);

    const hash = stdout.split('= ')[1];
    const hashOutFile = `${file}.sha256sum`;

    fs.writeFileSync(hashOutFile, hash);

    console.log('Wrote hash successfully to file:', hashOutFile);
}

/**
 * Function to verify the newly created signature against public key
 *
 * @param {string} pubKeyPath public key matching private key given in argv.key (--key).
 */
async function verifySignature(pubKeyPath, file, sigFile) {
    const { stdout } = await promisify(exec)(
        `openssl dgst -${hashAlgorithm} -verify ${pubKeyPath} -signature ${sigFile} ${file}`
    );

    console.log(stdout);
}

function getPublicKey() {
    return new Promise((resolve, reject) => {
        const req = https.get(publicKeyUrl, (res) => {
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

/**
 * Verify signature with remote (published) public key
 *
 * @param {*} file path to file to verify
 * @param {*} sigFile path to file containing signature
 */
async function verifyRemote(file, sigFile) {
    console.log('\nVerification of signature with remote public key:');

    try {
        const content = await getPublicKey();
        await executeWithTempFile(content)((key) =>
            verifySignature(key, file, sigFile)
        );
    } catch (e) {
        console.error(e);
    }
}

/**
 * Produce signature of file checksum.
 *
 * The signature can be verified by running the following command:
 * openssl dgst -<hash-algorithm> -verify <pubkey-file> -signature <signature-file> <file>
 * (e.g. openssl dgst -sha256 -verify ./Downloads/concordium-desktop-wallet.pem -signature ./Downloads/concordium-desktop-wallet-1.0.0.dmg.hash.sig ./Downloads/concordium-desktop-wallet-1.0.0.dmg)
 */
async function writeSignature(file, shouldVerify = false) {
    const sigOutFile = `${file}.sig`;

    await promisify(exec)(
        `openssl dgst -${hashAlgorithm} -sign ${privateKeyPath} -out ${sigOutFile} ${file}`
    );

    console.log('Wrote sig successfully to file:', sigOutFile);

    if (!shouldVerify) {
        return;
    }

    if (verifyKeyPath) {
        verifySignature(verifyKeyPath, file, sigOutFile);
    } else if (!skiprv) {
        verifyRemote(file, sigOutFile);
    }
}

const linuxTargets = build.linux.target;
const winTargets = ['exe'];
const macTargets = ['dmg'];

function getTargetsFromArgs() {
    return [
        [linux, linuxTargets],
        [mac, macTargets],
        [win, winTargets],
    ]
        .filter(([include]) => include)
        .map(([, targets]) => targets)
        .flat(2);
}

let extensions = [...linuxTargets, ...winTargets, ...macTargets];

if (mac || win || linux) {
    extensions = getTargetsFromArgs();
}

const filesToDigest = inputFile
    ? [inputFile]
    : extensions
          .map((e) => path.resolve(dir, `${app.name}-${appVersion}.${e}`))
          .filter(fs.existsSync);

(async () => {
    if (!filesToDigest.length) {
        console.error(
            'Found no files for specified runtime arguments in directory:',
            dir
        );
    }
    for (let i = 0; i < filesToDigest.length; i += 1) {
        const file = filesToDigest[i];
        const shouldVerify = i === filesToDigest.length - 1;

        console.log('\nProcessing file:', file);

        try {
            await Promise.all([
                writeChecksum(file),
                writeSignature(file, shouldVerify),
            ]);
        } catch (e) {
            console.error(e);
        }
    }
})();
