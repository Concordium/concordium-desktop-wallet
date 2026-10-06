/* eslint-disable @typescript-eslint/no-var-requires */
// Linux builds retain the installed JS API and replace only its N-API 6 addon.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function run(command, args, options = {}) {
    return execFileSync(command, args, { stdio: 'inherit', ...options });
}

if (process.platform !== 'linux') {
    throw new Error('This SQLCipher build is only supported on Linux.');
}

const appDirectory = path.resolve(__dirname, '../app');
const packageFile = require.resolve('@journeyapps/sqlcipher/package.json', {
    paths: [appDirectory],
});
if (!packageFile.startsWith(`${path.join(appDirectory, 'node_modules')}/`)) {
    throw new Error('Install app dependencies before building SQLCipher.');
}
const opensslVersion = execFileSync('pkg-config', ['--modversion', 'openssl'], {
    encoding: 'utf8',
}).trim();
if (!opensslVersion.startsWith('3.')) {
    throw new Error(`Expected system OpenSSL 3, found ${opensslVersion}.`);
}

const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'wallet-sqlcipher-')
);
try {
    // 5.3.x omits sources; 5.2.0 includes the same SQLCipher 4.4.2 amalgamation.
    // This temporary build does not alter either Yarn lockfile or installed JS files.
    run('npm', [
        'install',
        '--prefix',
        temporaryDirectory,
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--package-lock=false',
        '@journeyapps/sqlcipher@5.2.0',
        'node-gyp@11.0.0',
    ]);
    const sourceDirectory = path.join(
        temporaryDirectory,
        'node_modules/@journeyapps/sqlcipher'
    );
    const gypFile = path.join(sourceDirectory, 'deps/sqlite3.gyp');
    // The old extraction action invokes "python", absent on modern Ubuntu.
    fs.writeFileSync(
        gypFile,
        fs.readFileSync(gypFile, 'utf8').replace("['python',", "['python3',")
    );
    run(
        process.execPath,
        [
            path.join(
                temporaryDirectory,
                'node_modules/node-gyp/bin/node-gyp.js'
            ),
            'rebuild',
            '--napi_build_version=6',
            '--module_name=node_sqlite3',
            '--module_path=./lib/binding/napi-v6-linux-' + process.arch,
        ],
        { cwd: sourceDirectory }
    );

    const binary = path.join(
        sourceDirectory,
        'build/Release/node_sqlite3.node'
    );
    const dependencies = execFileSync('readelf', ['-d', binary], {
        encoding: 'utf8',
    });
    if (
        !dependencies.includes('[libcrypto.so.3]') ||
        dependencies.includes('[libcrypto.so.1.1]')
    ) {
        throw new Error(
            'Built addon does not link exclusively to the expected OpenSSL 3 ABI.'
        );
    }
    const destination = path.join(
        path.dirname(packageFile),
        'lib/binding',
        `napi-v6-linux-${process.arch}`,
        'node_sqlite3.node'
    );
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(binary, destination);
    console.log(
        `SQLCipher addon linked to OpenSSL ${opensslVersion}: ${destination}`
    );
    console.log(
        'Rerun this command after yarn install, then run yarn test-sqlcipher-linux.'
    );
} finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
