import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '../constants/routes.json';
import { createCredential } from '../utils/rustInterface';
import identityjson from '../utils/idObject.json';
import context from '../utils/context.json';

async function createAccount(identity, setMessage) {
    setMessage('Please Wait');

    const mockIdentity = {
        getIdentityObject: () => identityjson.token.identityObject.value,
        getRandomness: () =>
            '2e5969a687fc6ae6741e8009813b99cf82ccd4958a90c0c1cc287a25aff7452d',
        getLedgerId: () => 4,
    };

    const credential = await createCredential(
        mockIdentity,
        context,
        setMessage
    );
    setMessage(`
Please sign credential on device:
Credential: ${credential}
    `);
    // sign: unsigned_credential.proofs.unsigned_challenge
    const Tranactionsignature; // TODO: fix this
    setMessage('Please wait');

    const payload = makeCredentialDeploymentPayload(credentialDeploymentInfo);
    const response = sendTransaction(payload);
    console.log(response);
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
                .then((account) => {
                    dispatch(addAccount(accountName, account));
                    dispatch(push(routes.IDENTITYISSUANCE_FINAL));
                })
                .catch((e) => 'creating account failed {} '.format(e));
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
