This is the repository for the desktop wallet.

## Install

First, Install yarn: https://classic.yarnpkg.com/en/docs/install

Then, clone the repo via git.

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
