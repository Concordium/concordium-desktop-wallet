This is the repository for the desktop wallet.

## Dependencies

You need the following to build and run the project:

-   Nodejs 12.18.3 (use NVM to target specific node version easily)
-   NPM 6.4.6 (comes automatically with node version above)
-   Yarn 1.x (https://classic.yarnpkg.com/en/docs/install)
-   Python 2.x (https://www.python.org/downloads/)
-   Rust (https://www.rust-lang.org/tools/install)
-   Wasm-pack (https://rustwasm.github.io/wasm-pack/installer/)

## Install

Clone the repo via git.

```bash
git clone https://gitlab.com/Concordium/desktopwallet.git
cd desktopwallet
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
