import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import {
    Account,
    AccountInfo,
    CredentialDeploymentInformation,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
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
import { getUpdateCredentialsCost } from '~/utils/transactionCosts';
import { useAccountInfo, useTransactionExpiryState } from '~/utils/dataHooks';
import { collapseFraction } from '~/utils/basicHelpers';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import LoadingComponent from './LoadingComponent';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { validateFee } from '~/utils/transactionHelpers';

import InputTimestamp from '~/components/Form/InputTimestamp';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

import { hasEncryptedBalance } from '~/utils/accountHelpers';

import styles from './UpdateAccountCredentials.module.scss';

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

function displayAccount(account: Account | undefined) {
    return (
        <>
            <h5 className={styles.PropertyName}>Account:</h5>
            <h2 className="mV0">
                {account ? account.name : 'Choose an account on the right'}
            </h2>
            <p className="textFaded mB40 mT5 body4">{account?.address}</p>
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
            <p className="mT5">
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
            <p className="mT5">
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

interface State {
    account?: Account;
}

interface AccountInfoCredential {
    credentialIndex: number;
    credential: CredentialDeploymentInformation;
}

interface Props {
    exchangeRate: Fraction;
}

/**
 * This component controls the flow of creating a updateAccountCredential transaction.
 * It contains the logic for displaying the current parameters.
 */
function UpdateCredentialPage({ exchangeRate }: Props): JSX.Element {
    const dispatch = useDispatch();
    const transactionKind = TransactionKindId.Update_credentials;

    const { pathname, state } = useLocation<State>();

    const location = pathname.replace(`${transactionKind}`, ':transactionKind');

    // const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>(state?.account);
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
        location,
        newCredentialAmount,
        newThreshold,
    ]);

    const accountInfo = useAccountInfo(account?.address);

    /**
     * Loads the credential information for the given account, and updates
     * the state accordingly with the information.
     */
    async function getCredentialInfo(currentAccountInfo: AccountInfo) {
        const credentialsForAccount: AccountInfoCredential[] = Object.entries(
            currentAccountInfo.accountCredentials
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
            (previous) => currentAccountInfo.accountThreshold || previous
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

    const [estimatedFee, setFee] = useState<Fraction>();
    const error = useMemo(() => {
        if (accountInfo && estimatedFee) {
            return validateFee(accountInfo, collapseFraction(estimatedFee));
        }
        return undefined;
    }, [accountInfo, estimatedFee]);

    useEffect(() => {
        if (account) {
            // Create a payload with the current settings, to estimate the fee.
            const payload = {
                addedCredentials: assignIndices(newCredentials, []),
                removedCredIds: credentialIds
                    .filter(([, status]) => status === CredentialStatus.Removed)
                    .map(([id]) => id),
                threshold: newThreshold || 1,
            };
            setFee(
                getUpdateCredentialsCost(
                    exchangeRate,
                    payload,
                    currentCredentials.length,
                    account.signatureThreshold
                )
            );
        } else {
            setFee(undefined);
        }
    }, [
        account,
        setFee,
        exchangeRate,
        newThreshold,
        newCredentials,
        credentialIds,
        currentCredentials.length,
    ]);

    useEffect(() => {
        if (accountInfo) {
            getCredentialInfo(accountInfo);
        }
    }, [accountInfo]);

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

        if (!account) {
            throw new Error('Unexpected missing account');
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
                    estimatedFee={estimatedFee}
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

    const showButton = ![
        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION,
        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION,
    ].includes(location);

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Update Account Credentials"
            stepTitle="Transaction Proposal - Update Account Credentials"
            delegateScroll
        >
            <Columns className={styles.columns} columnScroll divider>
                <Columns.Column header="Transaction Details">
                    <div className={styles.columnContainer}>
                        {displayAccount(account)}
                        <DisplayEstimatedFee
                            className={styles.LargePropertyValue}
                            estimatedFee={estimatedFee}
                        />
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
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={(_, info) =>
                                            !!info && !hasEncryptedBalance(info)
                                        }
                                        onAccountClicked={onContinue}
                                    />
                                )}
                            />
                        </Switch>
                        {showButton && (
                            <div className="flexColumn mT40">
                                <p className={styles.errorLabel}>{error}</p>
                                <Button
                                    disabled={!isReady || Boolean(error)}
                                    onClick={onContinue}
                                >
                                    Continue
                                </Button>
                            </div>
                        )}
                    </div>
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}

export default ensureExchangeRate(UpdateCredentialPage, LoadingComponent);
