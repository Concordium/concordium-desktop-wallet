import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { Card } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { createCredential as createCredentialRust } from '../../utils/rustInterface';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    Identity,
    CredentialDeploymentDetails,
    Dispatch,
} from '../../utils/types';
import { sendTransaction } from '../../utils/client';
import {
    addPendingAccount,
    confirmAccount,
    getNextAccountNumber,
} from '../../features/AccountSlice';
import { getGlobal } from '../../utils/httpRequests';
import { addToAddressBook } from '../../features/AddressBookSlice';
import { choiceError } from '../../features/ErrorSlice';

/**
 *   This function loads the ledger object and creates a credentialDeploymentInfo, and nesessary details
 */
async function createCredential(
    identity: Identity,
    accountNumber: number,
    attributes: string[],
    setMessage: (message: string) => void
): Promise<CredentialDeploymentDetails> {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);
    setMessage('Please Wait');

    const global = await getGlobal();
    return createCredentialRust(
        identity,
        accountNumber,
        global,
        attributes,
        setMessage,
        ledger
    );
}

/**
 * This function this creates the credential, then saves the accounts info, and then sends the credentialDeployment to a Node.
 * Returns the transactionId of the credentialDeployment transaction send.
 */
async function createAccount(
    accountName: string,
    identity: Identity,
    attributes: string[],
    setMessage: (message: string) => void,
    dispatch: Dispatch
) {
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
        accountNumber,
        accountAddress,
        credentialDeploymentInfo,
        transactionId
    );
    addToAddressBook(dispatch, {
        name: accountName,
        address: accountAddress,
        note: `Account ${accountNumber} of ${identity.name}`, // TODO: have better note
        readOnly: true,
    });

    const payload = Buffer.from(credentialDeploymentInfoHex, 'hex');

    try {
        const response = await sendTransaction(payload);
        if (response) {
            return transactionId;
        }
        // TODO: Should we delete the pending account?
        throw new Error(
            'We were unable to deploy the credential, due to the node rejecting the transaction.'
        );
    } catch (e) {
        throw new Error(
            'We were unable to deploy the credential, because the node could not be reached.'
        );
    }
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
    const [text, setText] = useState<string>();

    useEffect(() => {
        createAccount(accountName, identity, attributes, setText, dispatch)
            .then((transactionId) => {
                confirmAccount(dispatch, accountName, transactionId);
                return dispatch(push(routes.ACCOUNTCREATION_FINAL));
            })
            .catch(
                (e) =>
                    choiceError(dispatch, 'Unable to create account', `${e}`, [
                        { label: 'ok, thanks', location: routes.ACCOUNTS },
                    ]) // TODO: handle failure properly.
            );
    }, [identity, dispatch, accountName, setText, attributes]);

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Generating the Identity</Card.Header>
                <Card.Description>{text}</Card.Description>
            </Card.Content>
        </Card>
    );
}
