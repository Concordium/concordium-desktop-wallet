/* eslint-disable promise/always-return */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const https = require('https');
const { createHash, sign, verify } = require('crypto');

const { build } = require('../package.json');
const app = require('../app/package.json');
const { publicKeyUrl } = require('../app/constants/verification.json');

/**
 * @description
 * This script is used to generated verification assets needed for both automatic updates and manual verification of downloaded binaries by users.
 * Key pair used for signing should be generated using ed25519. One way to do this is through openssl (in terminal):
 *
 * openssl genpkey -algorithm ed25519 -outform PEM -out concordium-desktop-wallet-privkey.pem
 * openssl pkey -in concordium-desktop-wallet-pubkey.pem -pubout
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

function loadFileIntoCrypto(cryptoObj, file) {
    const stream = fs.createReadStream(file);
    stream.on('data', (data) => cryptoObj.update(data));

    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            cryptoObj.end();
            resolve();
        });
        stream.on('error', reject);
    });
}

const hashAlgorithm = 'sha256';

// Produce file checksum
async function writeChecksum(file) {
    const hash = createHash(hashAlgorithm);
    await loadFileIntoCrypto(hash, file);

    const sha256sum = hash.digest('hex');
    const hashOutFile = `${file}.sha256sum`;

    fs.writeFileSync(hashOutFile, sha256sum);

    console.log('Wrote hash successfully to file:', hashOutFile);
}

/**
 * Function to verify the newly created signature against public key
 *
 * @param {string} pubKey public key matching private key given in argv.key (--key).
 */
function verifySignature(pubKey, file, sigFile) {
    try {
        const success = verify(
            null,
            fs.readFileSync(file),
            pubKey,
            fs.readFileSync(sigFile)
        );

        if (success) {
            console.log('Verification succeeded');
        } else {
            console.log('Verification failed');
        }
    } catch (e) {
        console.error(e);
    }
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

let pubKey;

/**
 * Verify signature with remote (published) public key
 *
 * @param {*} file path to file to verify
 * @param {*} sigFile path to file containing signature
 */
async function verifyRemote(file, sigFile) {
    console.log('Verification of signature with remote public key:');

    try {
        if (!pubKey) {
            pubKey = await getPublicKey();
        }
        verifySignature(pubKey, file, sigFile);
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
async function writeSignature(file) {
    const sigOutFile = `${file}.sig`;

    const privKey = fs.readFileSync(privateKeyPath);
    const signature = sign(null, fs.readFileSync(file), privKey);

    fs.writeFileSync(sigOutFile, signature);

    console.log('Wrote sig successfully to file:', sigOutFile);

    if (verifyKeyPath) {
        verifySignature(fs.readFileSync(verifyKeyPath), file, sigOutFile);
    } else if (!skiprv) {
        await verifyRemote(file, sigOutFile);
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

        console.log('\nProcessing file:', file);

        try {
            await writeChecksum(file);
            await writeSignature(file);
        } catch (e) {
            console.error(e);
        }
    }
})();
