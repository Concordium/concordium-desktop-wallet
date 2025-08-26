import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import { getAccountAddress } from '@concordium/web-sdk';
import {
    CredentialDeploymentTransaction,
    getCredentialDeploymentTransactionHash,
} from '@concordium/web-sdk-v6';
import routes from '~/constants/routes.json';

import { createCredentialDetails } from '~/utils/rustInterface';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    ConfirmedIdentity,
    CommitmentsRandomness,
    CreationKeys,
    Dispatch,
    AttributeKeyName,
    Policy,
    AttributeKey,
} from '~/utils/types';
import { sendCredentialDeploymentTransaction } from '~/node/nodeRequests';
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
import errorMessages from '~/constants/errorMessages.json';
import { AccountCardView } from '~/components/AccountCard/AccountCard';
import SimpleLedgerWithCreationKeys from '~/components/ledger/SimpleLedgerWithCreationKeys';
import pairWallet from '~/utils/WalletPairing';
import { mapRecord, throwLoggedError } from '~/utils/basicHelpers';
import { getKeyExportType } from '~/utils/identityHelpers';

import generalStyles from '../AccountCreation.module.scss';
import styles from './GeneratePage.module.scss';

interface Props {
    accountName: string;
    identity: ConfirmedIdentity;
    attributes: AttributeKeyName[];
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

    async function sendCredential(
        transaction: CredentialDeploymentTransaction,
        accountAddress: string,
        signatures: string[]
    ) {
        try {
            const response = await sendCredentialDeploymentTransaction(
                transaction,
                signatures
            );
            if (response) {
                return;
            }
        } catch (e) {
            removeFailed(dispatch, accountAddress);
            throwLoggedError(
                'We were unable to deploy the credential, because the node could not be reached.'
            );
        }
        removeFailed(dispatch, accountAddress);
        throwLoggedError(
            'We were unable to deploy the credential, due to the node rejecting the transaction.'
        );
    }

    async function saveAccount(
        transactionId: string,
        accountAddress: string,
        credId: string,
        policy: Policy,
        credNumber: number,
        randomness: CommitmentsRandomness
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
            credId,
            policy,
            randomness
        );
    }

    function onError(message: string) {
        setModalContent(message);
        setModalOpen(true);
    }

    useEffect(() => {
        getNextCredentialNumber(identity.id)
            .then(setCredentialNumber)
            .catch((e) => {
                window.log.error(e, 'Call to Database Failed.');
                onError('Unable to read from database');
            });
    }, [identity.id]);

    const createAccount = useCallback(
        (keys: CreationKeys) => {
            return async (
                ledger: ConcordiumLedgerClient,
                setMessage: (message: string | JSX.Element) => void
            ) => {
                setMessage('Please wait');
                if (!credentialNumber) {
                    const errorMessage =
                        'Missing credentialNumber, which is required. This is an internal error.';
                    window.log.error(errorMessage);
                    onError(errorMessage);
                    return;
                }

                if (!global) {
                    onError(errorMessages.missingGlobal);
                    return;
                }

                const {
                    transaction,
                    signatures,
                } = await createCredentialDetails(
                    identity,
                    credentialNumber,
                    keys,
                    global,
                    attributes,
                    setMessage,
                    ledger
                );

                const accountAddress = getAccountAddress(
                    transaction.unsignedCdi.credId
                ).address;
                const transactionId = getCredentialDeploymentTransactionHash(
                    transaction,
                    signatures
                );

                try {
                    await saveAccount(
                        transactionId,
                        accountAddress,
                        transaction.unsignedCdi.credId,
                        transaction.unsignedCdi.policy,
                        credentialNumber,
                        {
                            ...transaction.randomness,
                            attributesRand: mapRecord(
                                transaction.randomness.attributesRand,
                                (x) => x,
                                (key) => AttributeKey[key as AttributeKeyName]
                            ),
                        }
                    );
                    await sendCredential(
                        transaction,
                        accountAddress,
                        signatures
                    );
                    window.log.info(`Sent credential deployment to node`);
                    confirmAccount(dispatch, accountAddress, transactionId);
                    dispatch(
                        push({
                            pathname: routes.ACCOUNTCREATION_FINAL,
                            state: accountAddress,
                        })
                    );
                } catch (e) {
                    window.log.error(e as Error, 'Account creation failed');
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
                        exportType={getKeyExportType(identity.version)}
                        compareButtonClassName="mT50"
                    />
                </Columns.Column>
            </Columns>
        </div>
    );
}
