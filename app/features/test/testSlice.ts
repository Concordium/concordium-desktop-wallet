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
    makeTestSimpleTransferTransaction,
} from '../../utils/test';

import ConcordiumLedgerClient from '../ledger/ConcordiumLedgerClient';
import {
    AccountTransaction,
    CredentialDeploymentInformation,
    NewAccount,
    Policy,
    VerifyKey,
    YearMonth,
} from '../../utils/types';
import { PublicInformationForIp } from '../ledger/PublicInformationForIp';
import { AccountPathInput } from '../ledger/Path';

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

export async function credentialDeploymentTest() {
    const transport = await TransportNodeHid.open('');
    const ledgerClient = new ConcordiumLedgerClient(transport);

    const key: VerifyKey = {
        scheme: 0,
        key: Buffer.from(
            'b6bc751f1abfb6440ff5cce27d7cdd1e7b0b8ec174f54de426890635b27e7daf',
            'hex'
        ),
    };

    const newAccount: NewAccount = {
        keys: [key],
        threshold: 1,
    };

    const arData = new Map();
    arData.set(
        '1',
        Buffer.from(
            'aca024ce6083d4956edad825c3721da9b61e5b3712606ba1465f7818a43849121bdb3e4d99624e9a74b9436cc8948d178b9b144122aa070372e3fadee4998e1cc21161186a3d19698ad245e10912810df1aaddda16a27f654716108e27758099',
            'hex'
        )
    );
    arData.set(
        '2',
        Buffer.from(
            'bac024ce6083d4956edad825c3721da9b61e5b3712606ba1465f7818a43849121bdb3e4d99624e9a74b9436cc8948d178b9b144122aa070372e3fadee4998e1cc21161186a3d19698ad245e10912810df1aaddda16a27f654716108e27758099',
            'hex'
        )
    );

    const createdAt: YearMonth = {
        month: 12,
        year: 2020,
    };

    const validTo: YearMonth = {
        month: 12,
        year: 2021,
    };

    const attributes = new Map();
    attributes.set(0, 'John');
    attributes.set(1, 'Doe');
    const policy: Policy = {
        createdAt,
        validTo,
        revealedAttributes: attributes,
    };

    const credentialDeployment: CredentialDeploymentInformation = {
        values: {
            account: newAccount,
            ipId: 13,
            regId: Buffer.from(
                '89a1f69196a1d0423f4936aa664da95de16f40a639dba085073c5a7c8e710c2a402136cc89a39c12ed044e1035649c0f',
                'hex'
            ),
            revocationThreshold: 2,
            arData,
            policy,
        },
        proofs: Buffer.from(
            'af609b5bf3ad821773144ed066fb4cfe1194e430f4f97aa228f409472f51bddc0f32bf34f2e1048c8bee2d19414eb76a',
            'hex'
        ),
    };

    const signature = await ledgerClient.signCredentialDeployment(
        credentialDeployment,
        [0, 0, 2, 0, 0, 0]
    );
    console.log(`Signature: ${signature.toString('hex')}`);
}

export async function publicInformationForIpTest() {
    const transport = await TransportNodeHid.open('');
    const ledgerClient = new ConcordiumLedgerClient(transport);

    const publicInforForIp: PublicInformationForIp = {
        idCredPub:
            '8196e718f392ec8d07216b22b555cbb71bcee88037566d3f758b9786b945e3b614660f4bf954dbe57bc2304e5a863d2e',
        regId:
            '89a1f69196a1d0423f4936aa664da95de16f40a639dba085073c5a7c8e710c2a402136cc89a39c12ed044e1035649c0f',
        verificationKeys: [
            'b6bc751f1abfb6440ff5cce27d7cdd1e7b0b8ec174f54de426890635b27e7daf',
            '46a3e38ddf8b493be6e979034510b91db5448da9cba48c106139c288d658a004',
            '71d5f16bc3be249043dc0f9e20b4872f5c3477bf2f285336609c5b0873ab3c9c',
        ],
        threshold: 2,
    };

    const accountPathInput: AccountPathInput = {
        identityIndex: 0,
        accountIndex: 0,
        signatureIndex: 0,
    };
    const signature = await ledgerClient.signPublicInformationForIp(
        publicInforForIp,
        accountPathInput
    );
    console.log(`Signature: ${signature.toString('hex')}`);
}

export async function ledgerTest() {
    const transport = await TransportNodeHid.open('');
    const ledgerClient = new ConcordiumLedgerClient(transport);

    const idCredSec = await ledgerClient.getIdCredSec(0);
    console.log(`idCredSec: ${idCredSec.toString('hex')}`);

    const prfKey = await ledgerClient.getPrfKey(0);
    console.log(`prfKey: ${prfKey.toString('hex')}`);

    const publicKey = await ledgerClient.getPublicKey([0, 0, 0, 0, 0, 0]);
    console.log(`Public-key: ${publicKey.toString('hex')}`);

    const signature = await ledgerClient.signTransfer(
        makeTestSimpleTransferTransaction(),
        [0, 0, 0, 0, 0, 0]
    );
    console.log(`Signature: ${signature.toString('hex')}`);
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
