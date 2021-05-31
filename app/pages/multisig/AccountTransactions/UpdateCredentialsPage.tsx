import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import {
    Account,
    AccountInfo,
    Identity,
    CredentialDeploymentInformation,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import AddCredential from './AddCredential';
import ChangeSignatureThreshold from './ChangeSignatureThreshold';
import routes from '~/constants/routes.json';
import CreateUpdate from './CreateUpdate';
import { CredentialStatus } from './CredentialStatus';
import UpdateAccountCredentialsHandler from '~/utils/transactionHandlers/UpdateAccountCredentialsHandler';
import Columns from '~/components/Columns';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';
import { getUpdateCredentialsCost } from '~/utils/transactionCosts';
import { useAccountInfo } from '~/utils/hooks';
import { collapseFraction } from '~/utils/basicHelpers';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import LoadingComponent from './LoadingComponent';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { validateFee } from '~/utils/transactionHelpers';

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
            <h2 className="mV0">
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
    const location = useLocation().pathname.replace(
        `${transactionKind}`,
        ':transactionKind'
    );

    const [isReady, setReady] = useState(false);
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
                />
            </div>
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
                                        setReady={setReady}
                                        currentThreshold={
                                            account?.signatureThreshold || 1
                                        }
                                        newCredentialAmount={
                                            credentialIds.filter(
                                                ([, status]) =>
                                                    status !==
                                                    CredentialStatus.Removed
                                            ).length
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
                                        setReady={setReady}
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
                                        setReady={setReady}
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        identity={identity}
                                    />
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
                                        setReady={setReady}
                                        setIdentity={setIdentity}
                                    />
                                )}
                            />
                        </Switch>
                        {showButton && (
                            <div className="flexColumn mT40">
                                <p className={styles.errorLabel}>{error}</p>
                                <Button
                                    disabled={!isReady || Boolean(error)}
                                    onClick={() => {
                                        setReady(false);
                                        dispatch(
                                            push({
                                                pathname: handler.creationLocationHandler(
                                                    location
                                                ),
                                                state:
                                                    TransactionKindId.Update_credentials,
                                            })
                                        );
                                    }}
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
