import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import routes from '../constants/routes.json';
import { createCredential } from '../utils/rustInterface';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';

import { sendTransaction } from '../utils/client';
import { addPendingAccount, confirmAccount } from '../features/AccountSlice';
import { getGlobal } from '../utils/httpRequests';

async function createAccount(identity, setMessage) {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);
    setMessage('Please Wait');

    const mockIdentity = {
        getIdentityObject: () => JSON.parse(identity.identityObject).value,
        getRandomness: () =>
            '1643b3ad11b178ca053c523105f24f7a83ed97bdc4033241baf7e4a15f890fe6', // identity.privateIdObjectDataEncrypted,
        getLedgerId: () => identity.id,
    };
    const accountNumber = 3;

    const global = (await getGlobal()).value;
    const credentialDeploymentInformation = await createCredential(
        mockIdentity,
        accountNumber,
        JSON.parse(identity.identityProvider),
        global,
        setMessage,
        ledger
    );
    console.log(credentialDeploymentInformation);
    const payload = Buffer.from(credentialDeploymentInformation.hex, 'hex');

    const response = await sendTransaction(payload);
    console.log(response.getValue());
    return {
        accountAddress: credentialDeploymentInformation.address,
        credentialDeploymentInformation:
            credentialDeploymentInformation.credInfo,
        transactionId: credentialDeploymentInformation.hash,
        accNumber: accountNumber,
    };
}

export default function AccountCreationGenerate(
    accountName,
    identity
): JSX.Element {
    const dispatch = useDispatch();
    const [text, setText] = useState();

    useEffect(() => {
        if (identity !== undefined) {
            createAccount(identity, setText)
                .then(
                    ({
                        accountAddress,
                        credentialDeploymentInformation,
                        transactionId,
                        accNumber,
                    }) => {
                        addPendingAccount(
                            dispatch,
                            accountName,
                            identity.name,
                            accNumber,
                            accountAddress,
                            credentialDeploymentInformation
                        );
                        confirmAccount(dispatch, accountName, transactionId);
                        dispatch(push(routes.ACCOUNTCREATION_FINAL));
                    }
                )
                .catch((e) =>
                    console.log(`creating account failed: ${e.stack} `)
                );
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
