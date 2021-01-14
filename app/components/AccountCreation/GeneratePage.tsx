import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import routes from '../../constants/routes.json';
import { createCredential as createCredentialRust } from '../../utils/rustInterface';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { Identity, CredentialDeploymentDetails } from '../../utils/types';
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
    return createCredentialRust(
        identity,
        accountNumber,
        global,
        attributes,
        setMessage,
        ledger
    );
}

async function createAccount(identity, attributes, setMessage) {
    const accountNumber = await getNextAccountNumber(identity.id);
    const {
        credentialDeploymentInfoHex,
        credentialDeploymentInfo,
        accountAddress,
        transactionId,
    }: CredentialDeploymentDetails = await createCredential(
        identity,
        accountNumber,
        attributes,
        setMessage
    );

    await addPendingAccount(
        dispatch,
        accountName,
        identity.id,
        accNumber,
        accountAddress,
        credentialDeploymentInfo
    );

    const payload = Buffer.from(credentialDeploymentInfoHex, 'hex');
    const response = await sendTransaction(payload);
    // TODO Handle the case where we get a negative response from the Node
    return transactionId;
}

interface Props {
    accountName: string;
    identity: Identity;
    attributes: string[];
}

export default function AccountCreationGenerate({
    accountName,
    attributes,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [text, setText] = useState();

    useEffect(() => {
        createAccount(identity, attributes, setText)
            .then((transactionId) => {
                confirmAccount(dispatch, accountName, transactionId);
                return dispatch(push(routes.ACCOUNTCREATION_FINAL));
            })
            .catch(
                (e) => console.log(`creating account failed: ${e.stack} `) // TODO: handle failure properly
            );
    }, [identity, dispatch, accountName, setText, attributes]);

    return (
        <div>
            <h2>
                <pre>{text}</pre>
            </h2>
        </div>
    );
}
