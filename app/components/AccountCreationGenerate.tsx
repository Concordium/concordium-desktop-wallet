import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '../constants/routes.json';
import { createCredential } from '../utils/rustInterface';
import identityjson from '../utils/idObject.json';
import context from '../utils/context.json';
import { makeCredentialDeploymentPayload } from '../utils/transactionSerialization';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import { serializeCredentialDeployment } from '../utils/transactionSerialization';
import { sendTransaction } from '../utils/client';
import { addAccount, confirmAccount } from '../features/accountsSlice';

import signature from '../constants/signature.json';
import credential from '../constants/credential.json';

async function createAccount(identity, setMessage) {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);
    setMessage('Please Wait');

    const mockIdentity = {
        getIdentityObject: () => identityjson.token.identityObject.value,
        getRandomness: () =>
            '0346ae8dd7937ca1421ce20f1784b21c37206e75dadbfe2c4d40942a35ab2073',
        getLedgerId: () => 5,
    };
    const accountNumber = 1;

    const credentialDeploymentInformation = await createCredential(
        mockIdentity,
        accountNumber,
        context,
        setMessage,
        ledger
    );
    const extra = new Uint8Array(2);
    extra[0] = 0; // version
    extra[1] = 1; // credDep Kind
    const payload = Buffer.concat([extra, Buffer.from(credentialDeploymentInformation.hex,'hex')]);
    const response = sendTransaction(payload);
    console.log(response);
    return {
        response: response,
        hash: credentialDeploymentInformation.hash,
        info: credentialDeploymentInformation.info
    };
}

export default function AccountCreationGenerate(
    accountName,
    identity
): JSX.Element {
    const dispatch = useDispatch();
    const [text, setText] = useState();

    console.log(identity);
    useEffect(() => {
        if (identity !== undefined) {
            createAccount(identity, setText)
                .then(({response, hash}) => {
                    dispatch(addAccount({accountName, identityName: identity.name}));
                    confirmAccount(dispatch, accountName, hash);
                    dispatch(push(routes.ACCOUNTCREATION_FINAL));
                })
                .catch((e) => console.log(`creating account failed: ${e.stack} `));
        }
    }, [identity, dispatch, accountName, setText]);

    return (
        <div>
            <h2>
                <pre>{text}</pre>
            </h2>
        </div>
    );
}
