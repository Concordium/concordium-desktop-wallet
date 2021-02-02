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

## Starting Development

Start the app in the `dev` environment.

```bash
yarn start
```

Alternatively you can, in one terminal, run:

```bash
yarn start-renderer-dev
```

This will start the webpack server, and then, in another terminal, run:

```bash
yarn start-main-dev
```

To open the app.

This way, you can get quicker reloads, because you only need to restart start-main-dev,
as the renderer thread will recompile in the background. N.B. This doesn't apply for changes in the rust code,
which is only recompiled with a full restart.

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```
