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
const { version, name } = require('../app/package.json');

/**
 * This CLI relies on openssl under the hood to generate and verify hashes and signatures. As such, running the script in a shell that doesn'
 * t have access to openssl CLI will fail.
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

const {
    file: inputFile,
    key: publicKeyPath,
    verify: verifyKeyPath,
    skiprv,
} = argv;

const hashAlgorithm = 'sha256';

// Produce file checksum
async function writeChecksum(file) {
    const { stdout } = await exec(`openssl dgst -${hashAlgorithm} ${file}`);

    const hash = stdout.split('= ')[1];
    const hashOutFile = `${file}.hash`;

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

// TODO: change this to the correct url.
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

/**
 * Verify signature with remote (published) public key
 *
 * @param {*} file path to file to verify
 * @param {*} sigFile path to file containing signature
 */
async function verifyRemote(file, sigFile) {
    console.log('\nVerificiation of signature with remote public key:');

    try {
        const content = await getRemotePubKey();
        await executeWithTempFile(content)((p) =>
            verifySignature(p, file, sigFile)
        );
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
async function writeSignature(file, shouldVerify = false) {
    const sigOutFile = `${file}.sig`;

    await promisify(exec)(
        `openssl dgst -${hashAlgorithm} -sign ${publicKeyPath} -out ${sigOutFile} ${file}`
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

let extensions = build.linux.target;

if (process.platform === 'darwin') {
    extensions = ['dmg', 'zip'];
} else if (process.platform === 'win32') {
    extensions = ['exe'];
}

const filesToDigest = inputFile
    ? [inputFile]
    : extensions.map((e) =>
          path.resolve(
              __dirname,
              `../${build.directories.output}/${name}-${version}.${e}`
          )
      );

(async () => {
    for (let i = 0; i < filesToDigest.length; i += 1) {
        const file = filesToDigest[i];
        const shouldVerify = i === filesToDigest.length - 1;

        console.log('\nProcessing file:', file);

        await Promise.all([
            writeChecksum(file),
            writeSignature(file, shouldVerify),
        ]);
    }
})();
