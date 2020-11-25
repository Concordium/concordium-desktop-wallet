import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import * as crypto from 'crypto';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { RootState } from '../../store';
import { getBlockSummary, sendTransaction } from '../../utils/client';
import {
    serializeTransaction,
    serializeCredentialDeployment,
} from '../../utils/transactionSerialization';
import {
    buildCredDep,
    makeTestTransferWithScheduleTransaction,
    binaryVersionAsHex,
} from '../../utils/test';

import ConcordiumLedgerClient from '../ledger/ConcordiumLedgerClient';

const testSlice = createSlice({
    name: 'test',
    initialState: {
        blockHash:
            '489aea825843bb96b7e09b8a69bd6d70ace9949dd385801060801dd3c1533bee',
        summary: '',
    },
    reducers: {
        handleFieldChange: (state, payload) => {
            state.blockHash = payload.payload;
        },
        updateSummary: (state, newSummary) => {
            state.summary = newSummary.payload;
        },
    },
});

export const blockHashValue = (state: RootState) => state.test.blockHash;

export const blockSummary = (state: RootState) => state.test.summary;

export const { handleFieldChange, updateSummary } = testSlice.actions;

export async function showBlockSummary(dispatch, blockHash) {
    return getBlockSummary(blockHash)
        .catch((error) => console.log(error))
        .then((response) =>
            dispatch(updateSummary(JSON.stringify(response, null, 3)))
        );
}

function makeSignatures(transaction, hash): Buffer {
    const keyPairs = { 0: '', 1: '' };
    const signatures = new Array(2);

    for (const index in keyPairs) {
        const { privateKey } = crypto.generateKeyPairSync('ed25519'); // TODO: Use actual Keys instead of generating random
        const signature = crypto.sign(null, hash, privateKey);
        signatures[index] = signature;
    }
    return signatures;
}

function printAsHex(array) {
    console.log(Buffer.from(array).toString('hex'));
}

export async function ledgerTest() {
  const transport = await TransportNodeHid.open('');
  const ledgerClient = new ConcordiumLedgerClient(transport);
  const idCredSec = (await ledgerClient.getIdCredSec(0)).idCredSecSeed;
  const prfKey = (await ledgerClient.getPrfKey(0)).prfKeySeed;
  const { publicKey } = await ledgerClient.getPublicKey([0, 0, 0, 0, 0, 0]);
  console.log(`Public-key: ${publicKey.toString('hex')}`);
  console.log(`idCredSec: ${idCredSec.toString('hex')}`);
  console.log(`prfKey: ${prfKey.toString('hex')}`);
}

export async function printCredentialDeployment() {
    const cred = buildCredDep();
    const serialized = serializeCredentialDeployment(cred);
    printAsHex(serialized);
}

export async function sendTransfer() {
    const payload = serializeTransaction(
        makeTestTransferWithScheduleTransaction(),
        makeSignatures
    );

    printAsHex(payload);

    sendTransaction(payload)
        .catch((error) => console.log(error))
        .then((response) => console.log(response));
}

export default testSlice.reducer;
