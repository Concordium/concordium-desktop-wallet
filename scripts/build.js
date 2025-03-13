/* eslint-disable @typescript-eslint/no-var-requires */
// Check if the renderer and main bundles are built
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

const builder = require('electron-builder');
const packageJson = require('../package.json');

const targetNet = process.env.TARGET_NET;
const skipSigning = process.env.SIGNING
    ? process.env.SIGNING.trim() === 'skip'
    : false;

let {
    name,
    productName,
    build: { appId },
} = packageJson;
let publishChannel;

if (targetNet && targetNet !== 'mainnet') {
    name = `${name}-${targetNet}`;
    productName = `${productName} ${targetNet}`;
    appId = `${appId}-${targetNet}`;
    publishChannel = targetNet;
}

builder.build({
    config: {
        publish: {
            channel: publishChannel,
        },
        extraMetadata: {
            name,
            productName,
        },
        appId,
        win: {
            artifactName: name + '-${version}.${ext}',
            target: ['nsis'],
            sign: __dirname + '/customSign.js',
            ...(skipSigning
                ? undefined
                : {
                      forceCodeSigning: true,
                      certificateSubjectName: 'Concordium Software ApS',
                  }),
        },
    },
    publish: 'never',
});
