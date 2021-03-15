import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { Card } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { createCredentialDetails } from '../../utils/rustInterface';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    Identity,
    CredentialDeploymentDetails,
    Dispatch,
} from '../../utils/types';
import { sendTransaction } from '../../utils/nodeRequests';
import {
    addPendingAccount,
    confirmAccount,
    removeAccount,
} from '../../features/AccountSlice';
import {
    addToAddressBook,
    removeFromAddressBook,
} from '../../features/AddressBookSlice';
import {
    removeCredentialsOfAccount,
    getNextCredentialNumber,
} from '../../database/CredentialDao';
import { insertNewCredential } from '../../features/CredentialSlice';
import { globalSelector } from '../../features/GlobalSlice';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import ErrorModal from '../../components/SimpleErrorModal';

interface Props {
    accountName: string;
    identity: Identity;
    attributes: string[];
}

function removeFailed(dispatch: Dispatch, accountAddress: string) {
    removeAccount(dispatch, accountAddress);
    removeCredentialsOfAccount(accountAddress);
    removeFromAddressBook(dispatch, { address: accountAddress });
}

export default function AccountCreationGenerate({
    accountName,
    attributes,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');

    async function sendCredential({
        credentialDeploymentInfoHex,
        accountAddress,
    }: CredentialDeploymentDetails) {
        const payload = Buffer.from(credentialDeploymentInfoHex, 'hex');

        try {
            const response = await sendTransaction(payload);
            if (response.getValue()) {
                return;
            }
        } catch (e) {
            removeFailed(dispatch, accountAddress);
            throw new Error(
                'We were unable to deploy the credential, because the node could not be reached.'
            );
        }
        removeFailed(dispatch, accountAddress);
        throw new Error(
            'We were unable to deploy the credential, due to the node rejecting the transaction.'
        );
    }

    async function saveAccount(
        {
            credentialDeploymentInfo,
            accountAddress,
            transactionId,
        }: CredentialDeploymentDetails,
        credentialNumber: number
    ) {
        await addPendingAccount(
            dispatch,
            accountName,
            identity.id,
            credentialNumber,
            accountAddress,
            credentialDeploymentInfo.credId,
            transactionId
        );
        await insertNewCredential(
            dispatch,
            accountAddress,
            credentialNumber,
            identity.id,
            credentialDeploymentInfo
        );
        addToAddressBook(dispatch, {
            name: accountName,
            address: accountAddress,
            note: `Account ${credentialNumber} of ${identity.name}`, // TODO: have better note
            readOnly: true,
        });
    }

    function onError(message: string) {
        setModalContent(message);
        setModalOpen(true);
    }

    async function createAccount(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        let credentialNumber;
        if (!global) {
            onError(`Unexpected missing global object`);
            return;
        }
        try {
            credentialNumber = await getNextCredentialNumber(identity.id);
        } catch (e) {
            onError(`Unable to create account due to ${e}`);
            return;
        }

        const credentialDeploymentDetails = await createCredentialDetails(
            identity,
            credentialNumber,
            global,
            attributes,
            setMessage,
            ledger
        );

        try {
            await saveAccount(credentialDeploymentDetails, credentialNumber);
            await sendCredential(credentialDeploymentDetails);
            confirmAccount(
                dispatch,
                accountName,
                credentialDeploymentDetails.transactionId
            );
            dispatch(push(routes.ACCOUNTCREATION_FINAL));
        } catch (e) {
            onError(`Unable to create account due to ${e}`);
        }
    }

    return (
        <Card fluid centered>
            <ErrorModal
                header="Unable to create account"
                content={modalContent}
                show={modalOpen}
                onClick={() => dispatch(push(routes.ACCOUNTS))}
            />
            <Card.Content textAlign="center">
                <Card.Header>Generating the Account Credentials</Card.Header>
                <Card.Content textAlign="center">
                    <LedgerComponent ledgerCall={createAccount} />
                </Card.Content>
            </Card.Content>
        </Card>
    );
}
