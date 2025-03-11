// Use smctl for signing on Windows.
// Source: https://docs.digicert.com/en/digicert-keylocker/code-signing/sign-with-third-party-signing-tools/windows-applications/sign-executables-with-electron-builder-using-ksp-library.html

'use strict';

const PKCS11_CONFIG_ENV_NAME = 'WINDOWS_PKCS11_CONFIG';
const KEYPAIR_ALIAS_ENV_NAME = 'WINDOWS_SM_KEYPAIR_ALIAS';

exports.default = async function (configuration) {
    if (configuration.path) {
        const config = process.env[PKCS11_CONFIG_ENV_NAME];
        if (!config) {
            throw new Error(
                `Missing env variable: ${PKCS11_CONFIG_ENV_NAME} for code signing.`
            );
        }
        const keypair = process.env[KEYPAIR_ALIAS_ENV_NAME];
        if (!config) {
            throw new Error(
                `Missing env variable: ${KEYPAIR_ALIAS_ENV_NAME} for code signing.`
            );
        }
        const command = `smctl sign --keypair-alias ${keypair} --config-file ${config} --input "${String(
                configuration.path
        )}" --verbose --exit-non-zero-on-fail --failfast`;
        console.log(`customSign: execSync: ${command}`)
        require('child_process').execSync(command, { stdio: "inherit" });
    }
};
