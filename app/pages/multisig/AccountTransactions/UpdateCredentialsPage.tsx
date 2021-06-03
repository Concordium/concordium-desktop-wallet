import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import {
    Account,
    Identity,
    CredentialDeploymentInformation,
    TransactionKindId,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from '~/components/PickAccount';
import AddCredential from './AddCredential';
import ChangeSignatureThreshold, {
    validateThreshold,
} from './ChangeSignatureThreshold';
import routes from '~/constants/routes.json';
import CreateUpdate from './CreateUpdate';
import { CredentialStatus } from './CredentialStatus';
import UpdateAccountCredentialsHandler from '~/utils/transactionHandlers/UpdateAccountCredentialsHandler';
import Columns from '~/components/Columns';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';
import InputTimestamp from '~/components/Form/InputTimestamp';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { getAccountInfoOfAddress } from '~/node/nodeHelpers';
import { useTransactionExpiryState } from '~/utils/dataHooks';

import styles from './UpdateAccountCredentials.module.scss';
import { hasEncryptedBalance } from '~/utils/accountHelpers';

const placeHolderText = (
    <h2 className={styles.LargePropertyValue}>To be determined</h2>
);

function assignIndices<T>(items: T[], usedIndices: number[]) {
    let candidate = 1;
    let i = 0;
    const assigned = [];
    while (i < items.length) {
        if (usedIndices.includes(candidate)) {
            candidate += 1;
        } else {
            assigned.push({
                index: candidate,
                value: items[i],
            });
            i += 1;
            candidate += 1;
        }
    }
    return assigned;
}

function subTitle(currentLocation: string) {
    switch (currentLocation) {
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
            return 'Identities';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
            return 'Accounts';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL:
            return 'New Credentials';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD:
            return ' ';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY:
            return 'Transaction expiry time';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION:
            return 'Signature and Hardware Wallet';
        default:
            throw new Error('unknown location');
    }
}

function displayIdentity(identity: Identity | undefined) {
    return (
        <>
            <h5 className={styles.PropertyName}>Identity:</h5>
            <h2 className={styles.LargePropertyValue}>
                {identity ? identity.name : 'Choose an ID on the right'}
            </h2>
        </>
    );
}

function displayAccount(account: Account | undefined) {
    return (
        <>
            <h5 className={styles.PropertyName}>Account:</h5>
            <h2 className={styles.LargePropertyValue}>
                {account ? account.name : 'Choose an account on the right'}
            </h2>
        </>
    );
}

function displaySignatureThreshold(
    currentThreshold: number | undefined,
    newThreshold: number | undefined
) {
    let body;
    if (!currentThreshold) {
        body = placeHolderText;
    } else {
        body = (
            <p>
                Current amount of required signatures: <b>{currentThreshold}</b>
                <br />
                New amount of required signatures: <b>{newThreshold || '?'}</b>
            </p>
        );
    }
    return (
        <>
            <h5 className={styles.PropertyName}>Signature Threshold:</h5>
            {body}
        </>
    );
}

function displayCredentialCount(
    currentAmount: number | undefined,
    newAmount: number
) {
    let body;
    if (!currentAmount) {
        body = placeHolderText;
    } else {
        body = (
            <p>
                Current amount of credentials: <b>{currentAmount}</b>
                <br />
                New amount of credentials: <b>{newAmount}</b>
            </p>
        );
    }
    return (
        <>
            <h5 className={styles.PropertyName}>Credentials:</h5>
            {body}
        </>
    );
}

function listCredentials(
    credentialIds: [string, CredentialStatus][],
    updateCredential: (credId: [string, CredentialStatus]) => void,
    isEditing: boolean
) {
    if (credentialIds.length === 0) {
        return null;
    }
    return credentialIds.map(([credId, status]) => {
        let buttonText = 'Remove';
        let statusText = null;
        if (status === CredentialStatus.Added) {
            statusText = <h2 className={clsx(styles.green, 'mB0')}>Added</h2>;
        } else if (status === CredentialStatus.Unchanged) {
            statusText = (
                <h2 className={clsx(styles.gray, 'mB0')}>Unchanged</h2>
            );
        } else if (status === CredentialStatus.Removed) {
            buttonText = 'Revert';
            statusText = <h2 className={clsx(styles.red, 'mB0')}>Removed</h2>;
        } else if (status === CredentialStatus.Original) {
            statusText = <h2 className="mB0">Original</h2>;
        }

        return (
            <div key={credId} className={styles.credentialListElement}>
                <div className="mR20">
                    {buttonText && isEditing && (
                        <Button
                            size="tiny"
                            onClick={() => updateCredential([credId, status])}
                            disabled={status === CredentialStatus.Original}
                        >
                            {buttonText}
                        </Button>
                    )}
                </div>
                <h5>{credId}</h5>
                <div className="mL20">{statusText}</div>
            </div>
        );
    });
}

interface AccountInfoCredential {
    credentialIndex: number;
    credential: CredentialDeploymentInformation;
}

/**
 * This component controls the flow of creating a updateAccountCredential transaction.
 * It contains the logic for displaying the current parameters.
 */
export default function UpdateCredentialPage(): JSX.Element {
    const dispatch = useDispatch();
    const transactionKind = TransactionKindId.Update_credentials;
    const location = useLocation().pathname.replace(
        `${transactionKind}`,
        ':transactionKind'
    );

    // const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [currentCredentials, setCurrentCredentials] = useState<
        AccountInfoCredential[]
    >([]);

    const handler = new UpdateAccountCredentialsHandler();

    const [newThreshold, setNewThreshold] = useState<number | undefined>();
    const [credentialIds, setCredentialIds] = useState<
        [string, CredentialStatus][]
    >([]);
    const [newCredentials, setNewCredentials] = useState<
        CredentialDeploymentInformation[]
    >([]);
    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

    const newCredentialAmount = credentialIds.filter(
        ([, status]) => status !== CredentialStatus.Removed
    ).length;

    const isReady = useMemo(() => {
        switch (location) {
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                return identity !== undefined;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
                return account !== undefined;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL:
                return currentCredentials !== undefined;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD:
                return newThreshold !== undefined
                    ? validateThreshold(newThreshold, newCredentialAmount)
                    : false;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY:
                return (
                    expiryTime !== undefined && expiryTimeError === undefined
                );
            default:
                return false;
        }
    }, [
        account,
        currentCredentials,
        expiryTime,
        expiryTimeError,
        identity,
        location,
        newCredentialAmount,
        newThreshold,
    ]);

    /**
     * Loads the credential information for the given account, and updates
     * the state accordingly with the information.
     */
    async function getCredentialInfo(inputAccount: Account) {
        const accountInfo = await getAccountInfoOfAddress(inputAccount.address);
        const credentialsForAccount: AccountInfoCredential[] = Object.entries(
            accountInfo.accountCredentials
        ).map((accountCredential) => {
            const credentialIndex = parseInt(accountCredential[0], 10);
            const cred = accountCredential[1].value.contents;
            if (cred.regId) {
                return {
                    credentialIndex,
                    credential: { ...cred, credId: cred.regId },
                };
            }
            return { credentialIndex, credential: cred };
        });
        setCurrentCredentials(credentialsForAccount);

        setNewThreshold(
            (previous) => inputAccount.signatureThreshold || previous
        );

        setCredentialIds(
            credentialsForAccount.map(({ credential, credentialIndex }) => {
                const { credId } = credential;
                const status =
                    credentialIndex === 0
                        ? CredentialStatus.Original
                        : CredentialStatus.Unchanged;
                return [credId, status];
            })
        );
    }

    useEffect(() => {
        if (account) {
            getCredentialInfo(account);
        }
    }, [account]);

    function updateCredentialStatus([removedId, status]: [
        string,
        CredentialStatus
    ]) {
        if (status === CredentialStatus.Added) {
            setCredentialIds((currentCredentialIds) =>
                currentCredentialIds.filter(([credId]) => credId !== removedId)
            );
            setNewCredentials((creds) =>
                creds.filter(({ credId }) => credId !== removedId)
            );
        } else if (
            status === CredentialStatus.Unchanged ||
            status === CredentialStatus.Removed
        ) {
            const newStatus =
                status === CredentialStatus.Unchanged
                    ? CredentialStatus.Removed
                    : CredentialStatus.Unchanged;
            setCredentialIds((currentCredentialIds) =>
                currentCredentialIds.map((item) =>
                    item[0] !== removedId ? item : [item[0], newStatus]
                )
            );
        }
    }

    function renderCreateUpdate() {
        if (!newThreshold) {
            throw new Error('Unexpected missing threshold');
        }
        if (!expiryTime) {
            throw new Error('Unexpected missing expiry');
        }
        const usedIndices: number[] = currentCredentials
            .filter(({ credential }) => {
                const { credId } = credential;
                const currentStatus = credentialIds.find(
                    ([id]) => credId === id
                );
                return (
                    currentStatus &&
                    currentStatus[1] === CredentialStatus.Unchanged
                );
            })
            .map(({ credentialIndex }) => credentialIndex || 0);

        return (
            <div
                className={clsx(
                    styles.createUpdateWrapper,
                    'flexColumn flexChildFill'
                )}
            >
                <CreateUpdate
                    account={account}
                    addedCredentials={assignIndices(
                        newCredentials,
                        usedIndices
                    )}
                    removedCredIds={credentialIds
                        .filter(
                            ([, status]) => status === CredentialStatus.Removed
                        )
                        .map(([id]) => id)}
                    newThreshold={newThreshold}
                    currentCredentialAmount={currentCredentials.length}
                    expiry={expiryTime}
                />
            </div>
        );
    }

    function onContinue() {
        const nextLocation = handler.creationLocationHandler(location);
        dispatch(
            push({
                pathname: nextLocation,
                state: TransactionKindId.Update_credentials,
            })
        );
    }

    const showButton =
        location !==
        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Update Account Credentials"
            stepTitle="Transaction Proposal - Update Account Credentials"
            delegateScroll
        >
            <Columns className={styles.columns} columnScroll divider>
                <Columns.Column header="Transaction Details">
                    <div className={styles.columnContainer}>
                        {displayIdentity(identity)}
                        {displayAccount(account)}
                        {displaySignatureThreshold(
                            account?.signatureThreshold,
                            newThreshold
                        )}
                        {displayCredentialCount(
                            currentCredentials.length,
                            credentialIds.length
                        )}
                        <DisplayTransactionExpiryTime
                            expiryTime={expiryTime}
                            placeholder="To be determined"
                        />
                        {listCredentials(
                            credentialIds,
                            updateCredentialStatus,
                            location ===
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL
                        )}
                    </div>
                </Columns.Column>
                <Columns.Column header={subTitle(location)}>
                    <div className={styles.rightColumnContainer}>
                        <Switch>
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD
                                }
                                render={() => (
                                    <ChangeSignatureThreshold
                                        currentThreshold={
                                            account?.signatureThreshold || 1
                                        }
                                        newThreshold={newThreshold}
                                        setNewThreshold={setNewThreshold}
                                    />
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL
                                }
                                render={() => (
                                    <AddCredential
                                        accountAddress={account?.address}
                                        credentialIds={credentialIds}
                                        addCredentialId={(newId) =>
                                            setCredentialIds(
                                                (currentCredentialIds) => [
                                                    ...currentCredentialIds,
                                                    newId,
                                                ]
                                            )
                                        }
                                        setNewCredentials={setNewCredentials}
                                    />
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT
                                }
                                render={() => (
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        identity={identity}
                                        filter={(_, info) =>
                                            !!info && !hasEncryptedBalance(info)
                                        }
                                    />
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY
                                }
                                render={() => (
                                    <div>
                                        <InputTimestamp
                                            label="Transaction expiry time"
                                            name="expiry"
                                            isInvalid={
                                                expiryTimeError !== undefined
                                            }
                                            error={expiryTimeError}
                                            value={expiryTime}
                                            onChange={setExpiryTime}
                                        />
                                        <p>
                                            Choose the expiry date for the
                                            transaction.
                                        </p>
                                        <p>
                                            Committing the transaction after
                                            this date, will result in rejection.
                                        </p>
                                    </div>
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION
                                }
                                render={renderCreateUpdate}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION
                                }
                                render={() => (
                                    <PickIdentity
                                        chosenIdentity={identity}
                                        setIdentity={setIdentity}
                                    />
                                )}
                            />
                        </Switch>
                        {showButton && (
                            <Button
                                disabled={!isReady}
                                className={styles.continueButton}
                                onClick={onContinue}
                            >
                                Continue
                            </Button>
                        )}
                    </div>
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}
