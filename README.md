This is the repository for the desktop wallet.

## Dependencies

You need the following to build and run the project:

-   Nodejs 14.16.0 (use NVM to target specific node version easily)
-   NPM 6.14.11 (comes automatically with node version above)
-   Yarn 1.x (https://classic.yarnpkg.com/en/docs/install)
-   Python 2.x (https://www.python.org/downloads/)
-   Rust (https://www.rust-lang.org/tools/install)
-   Wasm-pack (https://rustwasm.github.io/wasm-pack/installer/)

### Ubuntu

For ubuntu, a couple of extra dependencies are needed:

-   libusb 1.0 (`sudo apt-get install libusb-1.0`)
-   libudev-dev (`sudo apt-get install libudev-dev`)
-   rpm (`sudo apt-get install rpm`)

## Install

Clone the repo via git.

```bash
git clone https://github.com/Concordium/concordium-desktop-wallet.git
cd concordium-desktop-wallet
```

Make sure to initialize submodules:

```bash
git submodule update --init
```

Then install dependencies:

```bash
yarn
```

### Windows

On Windows you can run the above through e.g. Git bash, or if you want to run it from the Command Prompt, then
you must add `sh` to your PATH for the proto build to run. You can get `sh` bundled with Git bash.

## Starting Development

Start the app in the `dev` environment.

```bash
yarn start
```

Alternatively you can, in one terminal, run:

```bash
yarn build-main-dev && yarn start-renderer-dev
```

This will:

-   Build the electron main script
-   Start the webpack server for the electron renderer

Then, in another terminal, run:

```bash
yarn start:dev
```

To open the app.

This way, you can get quicker reloads, because you only need to restart start:dev,
as the renderer thread will recompile in the background. N.B. This doesn't apply for changes in the rust code,
which is only recompiled with a full restart.

## Targeting specific Network

To build the app for a specific network, supply the `TARGET_NET` environment variable.
Currently works with `stagenet` and `testnet`.
Otherwise the app will be targeted Mainnet.
When using this variable when packaging, this variable will also be appended to the application name.

```bash
TARGET_NET=stagenet yarn start
```

```bash
export TARGET_NET=stagenet
yarn build-main-dev && yarn start-renderer-dev
```

## Targeting Ledger emulator (Speculos)

It is possible to run the desktop wallet in development mode against a Ledger emulator (Speculos). Note
that this is not safe and is only relevant for development.

```bash
LEDGER_EMULATOR_URL=http://emulator-ip-address:port yarn start
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

### Mac specific code signing and notarizing

As the software is distributed outside of the Mac App Store, it needs to be signed _and_ notarized.

Running

```bash
yarn package
```

on a machine with MacOS will trigger the signing and notarizing processes. This requires a valid [Developer ID Application Certificate](https://developer.apple.com/support/certificates/) in the Keychain of the machine used for building, and a valid Apple Developer ID has to be logged into Xcode on the same machine.

When the build has finished, the signing process will be triggered, and if it succeeds it will continue with the notarizing process.

For the notarizing process to succeed, the Apple ID and it's password also needs to be available as the following
environment variables:

-   APPLEID=<example@e-mail.com>
-   APPLEIDPASS=The password for the Apple ID

For the APPLEIDPASS, setting up an [app-specific password](https://support.apple.com/en-us/HT204397) for the Apple ID is recommended.

The notarizing process can take a while, and for testing purposes it can be skipped by running:

```bash
TARGET_NET=$NET yarn package-mac-no-notarize
```

### Generating verification assets

Users are encouraged to verify the integrity of a downloaded application binary before installation. To support this, we need to generate a **hash** and a **signature** for each binary released. Furthermore, automatic updates also rely on these assets for verification of each update being installed.

To generate the assets, run:

```bash
yarn generate-verification-assets <path-to-private-key>
```

-   The private key used for this needs to match the public key published for verification, otherwise verification will not succeed.

By default, the script tries to generate a hash and sig file for all release binaries in `release/`. It also tries to verify the created signatures with Concordium's public key for the desktop wallet, which is published separately.

The script has a number of optional runtime arguments, which are documented in the underlying script file `scripts/fileDigest.js`.
