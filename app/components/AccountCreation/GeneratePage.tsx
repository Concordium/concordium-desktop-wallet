import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import routes from '../../constants/routes.json';
import { createCredential } from '../../utils/rustInterface';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';

import { sendTransaction } from '../../utils/client';
import {
    addPendingAccount,
    confirmAccount,
    getNextAccountNumber,
} from '../../features/AccountSlice';
import { getGlobal } from '../../utils/httpRequests';

async function createCredential(
    identity,
    accountNumber,
    attributes,
    setMessage
) {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);
    setMessage('Please Wait');

    const global = (await getGlobal()).value;
    const output = await createCredential(
        identity,
        accountNumber,
        global,
        attributes,
        setMessage,
        ledger
    );
    console.log(output);
    return {
        credentialHex: output.hex,
        accountAddress: output.address,
        credential: output.credInfo,
        transactionId: output.hash,
    };
}

async function createAccount(identity, attributes, setMessage) {
    const accountNumber = await getNextAccountNumber(identity.id);
    const {
        credential,
        credentialHex,
        accountAddress,
        transactionId,
    } = await createCredential(identity, accountNumber, attributes, setMessage);

    const payload = Buffer.from(credentialHex, 'hex');
    const response = await sendTransaction(payload);
    console.log(response.getValue());
    await addPendingAccount(
        dispatch,
        accountName,
        identity.id,
        accNumber,
        accountAddress,
        credential
    );
    return transactionId;
}

export default function AccountCreationGenerate(
    accountName,
    attributes,
    identity
): JSX.Element {
    const dispatch = useDispatch();
    const [text, setText] = useState();

    useEffect(() => {
        if (identity !== undefined) {
            createAccount(identity, attributes, setText)
                .then((transactionId) => {
                    confirmAccount(dispatch, accountName, transactionId);
                    return dispatch(push(routes.ACCOUNTCREATION_FINAL));
                })
                .catch((e) =>
                    console.log(`creating account failed: ${e.stack} `)
                );
        }
    }, [identity, dispatch, accountName, setText, attributes]);

    return (
        <div>
            <h2>
                <pre>{text}</pre>
            </h2>
        </div>
    );
}
