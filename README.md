This is the repository for the desktop wallet intended for use alongside the [ledger apps](https://github.com/Concordium/concordium-ledger-app).

## Dependencies

You need the following to build and run the project:

-   Nodejs 18.20.7 (use NVM to target specific node version easily)
-   Yarn 4.x (https://classic.yarnpkg.com/en/docs/install)
-   Python 3.x (https://www.python.org/downloads/)
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

### MacOS ARM

You'll likely see a lot of errors in the console when installing native dependencies. Ignore these and try to
build and run the application in the next steps to see if the installation was successful.

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

## Targeting specific network

To build the application for a specific network you must supply the `TARGET_NET` variable. If `TARGET_NET` is not
set the build will be for `mainnet`. Note that the `TARGET_NET` will be appended to the filenames for
`stagenet` and `testnet`.

Valid networks options are: `stagenet`, `testnet`, `protonet`, or `mainnet`. Default is `mainnet`.

```bash
TARGET_NET=testnet yarn package # or any other build/run command
```

## Targeting Ledger emulator (Speculos)

It is possible to run the desktop wallet in development mode against a Ledger emulator (Speculos). Note
that this is not safe and is only relevant for development.

```bash
LEDGER_EMULATOR_URL=http://emulator-ip-address:port yarn start
```

## Debugging with DevTools (this flow is needed on some ubuntu versions that don't support devTools in the app)

-   Read the [security implications](https://nodejs.org/en/learn/getting-started/debugging).

To start the debugging client, run:

```bash
yarn start:dev-debug
```

The output will be similar to:

```bash
ws://127.0.0.1:9229/0f2c936f-b1cd-4ac9-aab3-f63b0f33d55e
```

-   Open the inspector URL in your chrome browser, as follows:

```bash
chrome://inspect/#devices
```

-   Click the `Configure` button and configure your `listenAddress + port` as outputted by the previous command.

-   Click on `inspect`.

-   The electron app is now running in your chrome browser and you can use the `devTools`.

## Debugging production builds

It's possible to debug production builds by running the application from a terminal with the `--remote-debugging-port=9229` flag. This will allow you to debug the application in your chrome browser, by executing the following steps:

1. Open the inspector URL in your chrome browser, as follows:

```bash
chrome://inspect/#devices
```

2. Click the `Configure` button and configure your `listenAddress + port` as outputted by the previous command.

3. Click on `inspect`.

4. The electron app is now running in your chrome browser and you can use the `devTools`.

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

### Making a release

The wallet is released for each Concordium network and to release version `x.y.z` for `network`, where network is either `mainnet`, `testnet` or `stagenet`:

1. Make pull request updating the version `x.y.z` in `app/package.json` and updating `CHANGELOG.md`.
2. Once reviewed and merged into `main` branch, create and push a git tag of the form `desktop-wallet/{x.y.z}-{network}` on the commit to start the release pipeline.

   E.g release of `1.8.0` to Concordium Mainnet:

   ```sh
   # Create the tag
   git tag desktop-wallet/1.8.0-mainnet
   # Push to remote
   git push --tag origin desktop-wallet/1.8.0-mainnet
   ```

3. Create a Github release draft (don't make it public yet) for the tag, summarize the changes in the description.
4. The release pipeline needs access to secrets for code signing, so it require approval before it can run.
5. Once the build step is complete the build artifacts can be [downloaded and tested from the run.](https://github.com/Concordium/concordium-desktop-wallet/actions/workflows/release.yaml) before the last approval will generate the verification assets and upload everything to the Github release associated with the tag.
6. Verify the content and publish the Github release.
