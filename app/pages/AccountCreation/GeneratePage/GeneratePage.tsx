import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import { createCredentialDetails } from '~/utils/rustInterface';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    Identity,
    CredentialStatus,
    CredentialDeploymentDetails,
    CreationKeys,
    Dispatch,
} from '~/utils/types';
import { sendTransaction } from '~/node/nodeRequests';
import {
    addPendingAccount,
    confirmAccount,
    removeAccount,
} from '~/features/AccountSlice';
import {
    removeCredentialsOfAccount,
    getNextCredentialNumber,
} from '~/database/CredentialDao';
import { insertNewCredential } from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import ErrorModal from '~/components/SimpleErrorModal';
import Columns from '~/components/Columns';
import IdentityCard from '~/components/IdentityCard';
import CardList from '~/cross-app-components/CardList';
import { AttributeKey } from '~/utils/identityHelpers';
import errorMessages from '~/constants/errorMessages.json';
import { AccountCardView } from '~/components/AccountCard/AccountCard';
import SimpleLedgerWithCreationKeys from '~/components/ledger/SimpleLedgerWithCreationKeys';
import pairWallet from '~/utils/WalletPairing';

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
}

export default function AccountCreationGenerate({
    accountName,
    attributes,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const [credentialNumber, setCredentialNumber] = useState<number>();
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
        credNumber: number
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
            credNumber,
            identity.id,
            0, // credentialIndex = 0 on original
            CredentialStatus.Deployed,
            credentialDeploymentInfo
        );
    }

    function onError(message: string) {
        setModalContent(message);
        setModalOpen(true);
    }

    useEffect(() => {
        getNextCredentialNumber(identity.id)
            .then(setCredentialNumber)
            .catch(() => onError('Unable to read from database'));
    }, [identity.id]);

    const createAccount = useCallback(
        (keys: CreationKeys) => {
            return async (
                ledger: ConcordiumLedgerClient,
                setMessage: (message: string | JSX.Element) => void
            ) => {
                setMessage('Please wait');
                if (!credentialNumber) {
                    onError(
                        'Missing credentialNumber, which is required. This is an internal error.'
                    );
                    return;
                }

                if (!global) {
                    onError(errorMessages.missingGlobal);
                    return;
                }

                const credentialDeploymentDetails = await createCredentialDetails(
                    identity,
                    credentialNumber,
                    keys,
                    global,
                    attributes,
                    setMessage,
                    ledger
                );

                try {
                    await saveAccount(
                        credentialDeploymentDetails,
                        credentialNumber
                    );
                    await sendCredential(credentialDeploymentDetails);
                    confirmAccount(
                        dispatch,
                        credentialDeploymentDetails.accountAddress,
                        credentialDeploymentDetails.transactionId
                    );
                    dispatch(
                        push({
                            pathname: routes.ACCOUNTCREATION_FINAL,
                            state: credentialDeploymentDetails.accountAddress,
                        })
                    );
                } catch (e) {
                    onError(`Unable to create account due to ${e}`);
                }
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [global, credentialNumber, attributes, identity]
    );

    async function checkWallet(ledger: ConcordiumLedgerClient) {
        const walletId = await pairWallet(ledger, dispatch);
        if (walletId !== identity.walletId) {
            throw new Error(
                'The chosen identity was not created using the connected wallet.'
            );
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
                        <AccountCardView
                            className={clsx(
                                generalStyles.card,
                                styles.alignRight
                            )}
                            accountName={accountName}
                            identityName={identity.name}
                        />
                    </CardList>
                </Columns.Column>
                <Columns.Column>
                    <SimpleLedgerWithCreationKeys
                        identityNumber={identity.identityNumber}
                        className={generalStyles.card}
                        ledgerCallback={createAccount}
                        credentialNumber={credentialNumber}
                        preCallback={checkWallet}
                        compareButtonClassName="mT50"
                    />
                </Columns.Column>
            </Columns>
        </div>
    );
}
