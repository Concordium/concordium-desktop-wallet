import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import { createCredentialDetails } from '~/utils/rustInterface';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    Identity,
    CredentialDeploymentDetails,
    Dispatch,
    AccountStatus,
} from '~/utils/types';
import { sendTransaction } from '~/utils/nodeRequests';
import {
    addPendingAccount,
    confirmAccount,
    removeAccount,
} from '~/features/AccountSlice';
import {
    addToAddressBook,
    removeFromAddressBook,
} from '~/features/AddressBookSlice';
import {
    removeCredentialsOfAccount,
    getNextCredentialNumber,
} from '~/database/CredentialDao';
import { insertNewCredential } from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import ErrorModal from '~/components/SimpleErrorModal';
import pairWallet from '~/utils/WalletPairing';
import Columns from '~/components/Columns';
import IdentityCard from '~/components/IdentityCard';
import AccountListElement from '~/components/AccountListElement';
import CardList from '~/cross-app-components/CardList';
import { AttributeKey } from '~/utils/identityHelpers';

import generalStyles from '../AccountCreation.module.scss';
import styles from './GeneratePage.module.scss';

interface Props {
    accountName: string;
    identity: Identity;
    attributes: AttributeKey[];
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
            false,
            accountAddress,
            transactionId
        );
        await insertNewCredential(
            dispatch,
            accountAddress,
            credentialNumber,
            identity.id,
            0, // credentialIndex = 0 on original
            credentialDeploymentInfo
        );
        addToAddressBook(dispatch, {
            name: accountName,
            address: accountAddress,
            note: `Account for credential ${credentialNumber} of ${identity.name}`, // TODO: have better note
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

        const walletId = await pairWallet(ledger);
        if (walletId !== identity.walletId) {
            throw new Error(
                'The chosen identity was not created using the connected wallet.'
            );
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
                credentialDeploymentDetails.accountAddress,
                credentialDeploymentDetails.transactionId
            );
            dispatch(push(routes.ACCOUNTCREATION_FINAL));
        } catch (e) {
            onError(`Unable to create account due to ${e}`);
        }
    }

    return (
        <div className={generalStyles.singleColumn}>
            <ErrorModal
                header="Unable to create account"
                content={modalContent}
                show={modalOpen}
                onClick={() => dispatch(push(routes.ACCOUNTS))}
            />
            <h2 className={styles.header}>Confirm and sign account creation</h2>
            <p className={styles.description}>
                The following shows a summary of the data used to create your
                new account. Please confirm that this looks correct before
                signing and creating the account.
            </p>
            <Columns className="mT50">
                <Columns.Column>
                    <CardList>
                        <IdentityCard
                            className={clsx(
                                generalStyles.card,
                                styles.alignRight
                            )}
                            identity={identity}
                            showAttributes={attributes}
                        />
                        <AccountListElement
                            className={clsx(
                                generalStyles.card,
                                styles.alignRight
                            )}
                            account={{
                                name: accountName,
                                address: '',
                                isInitial: false,
                                status: AccountStatus.Confirmed,
                                identityId: -1,
                                maxTransactionId: -1,
                                identityName: identity.name,
                            }}
                        />
                    </CardList>
                </Columns.Column>
                <Columns.Column>
                    <SimpleLedger
                        className={generalStyles.card}
                        ledgerCall={createAccount}
                    />
                </Columns.Column>
            </Columns>
        </div>
    );
}
