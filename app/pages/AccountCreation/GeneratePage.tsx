import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { createCredential } from '../../utils/rustInterface';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { Identity, CredentialDeploymentDetails } from '../../utils/types';
import { sendTransaction } from '../../utils/client';
import {
    addPendingAccount,
    confirmAccount,
    getNextAccountNumber,
} from '../../features/AccountSlice';
import { getGlobal } from '../../utils/httpRequests';
import { addToAddressBook } from '../../features/AddressBookSlice';
import { choiceError } from '../../features/ErrorSlice';
import LedgerComponent from '../../components/ledger/LedgerComponent';

interface Props {
    accountName: string;
    identity: Identity;
    attributes: string[];
}

async function sendCredential(credentialDeploymentInfoHex: string) {
    const payload = Buffer.from(credentialDeploymentInfoHex, 'hex');

    try {
        const response = await sendTransaction(payload);
        if (response) {
            return;
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

export default function AccountCreationGenerate({
    accountName,
    attributes,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();

    async function saveAccount(
        {
            credentialDeploymentInfo,
            accountAddress,
            transactionId,
        }: CredentialDeploymentDetails,
        accountNumber: number
    ) {
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
    }

    async function createAccount(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        const global = await getGlobal();
        const accountNumber = await getNextAccountNumber(identity.id);

        const credentialDeploymentDetails = await createCredential(
            identity,
            accountNumber,
            global,
            attributes,
            setMessage,
            ledger
        );

        try {
            saveAccount(credentialDeploymentDetails, accountNumber);
            sendCredential(
                credentialDeploymentDetails.credentialDeploymentInfoHex
            );
            confirmAccount(
                dispatch,
                accountName,
                credentialDeploymentDetails.transactionId
            );
            dispatch(push(routes.ACCOUNTCREATION_FINAL));
        } catch (e) {
            choiceError(dispatch, 'Unable to create account', `${e}`, [
                { label: 'ok, thanks', location: routes.ACCOUNTS },
            ]); // TODO: handle failure properly.
        }
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Generating the Account Credentials</Card.Header>
                <Card.Content textAlign="center">
                    <LedgerComponent ledgerCall={createAccount} />
                </Card.Content>
            </Card.Content>
        </Card>
    );
}
