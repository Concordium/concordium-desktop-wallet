import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import {
    InitialCredentialDeploymentValues,
    CredentialDeploymentValues,
} from '@concordium/node-sdk/lib/src/types';
import Button from '~/cross-app-components/Button';
import {
    Account,
    AccountInfo,
    CredentialDeploymentInformation,
    Fraction,
    AddedCredential,
    TransactionKindId,
} from '~/utils/types';
import PickAccount from '~/components/PickAccount';
import AddCredential from './AddCredential';
import ChangeSignatureThreshold, {
    validateThreshold,
} from './ChangeSignatureThreshold';
import routes from '~/constants/routes.json';
import CreateUpdate from './CreateUpdate';
import UpdateAccountCredentialsHandler from '~/utils/transactionHandlers/UpdateAccountCredentialsHandler';
import Columns from '~/components/Columns';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';
import { getUpdateCredentialsCost } from '~/utils/transactionCosts';
import { useAccountInfo, useTransactionExpiryState } from '~/utils/dataHooks';
import { collapseFraction, throwLoggedError } from '~/utils/basicHelpers';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import LoadingComponent from '../LoadingComponent';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { validateFee } from '~/utils/transactionHelpers';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { hasEncryptedBalance } from '~/utils/accountHelpers';
import {
    credentialsSelector,
    externalCredentialsSelector,
} from '~/features/CredentialSlice';
import { getNoteForOwnCredential } from '~/utils/credentialHelper';
import { identitiesSelector } from '~/features/IdentitySlice';
import { CredentialDetails, CredentialStatus } from './util';
import DatePicker from '~/components/Form/DatePicker';
import { AccountDetail, PlainDetail } from '../proposal-details/shared';

import styles from './UpdateAccountCredentials.module.scss';

function assignIndices(
    items: Omit<AddedCredential, 'index'>[],
    usedIndices: number[]
): AddedCredential[] {
    let candidate = 1;
    let i = 0;
    const assigned: AddedCredential[] = [];

    while (i < items.length) {
        if (usedIndices.includes(candidate)) {
            candidate += 1;
        } else {
            const { value, note } = items[i];
            assigned.push({
                index: candidate,
                value,
                note,
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
            return 'New credentials';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD:
            return ' ';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY:
            return 'Transaction expiry time';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION:
            return 'Signature and hardware wallet';
        default:
            return throwLoggedError('unknown location');
    }
}

function displaySignatureThreshold(
    currentThreshold: number | undefined,
    newThreshold: number | undefined
) {
    return (
        <PlainDetail
            title="Signature threshold"
            value={currentThreshold}
            format={() => (
                <p className="mT5 mono body3">
                    Current amount of required signatures:{' '}
                    <b>{currentThreshold}</b>
                    <br />
                    New amount of required signatures:{' '}
                    <b>{newThreshold || '?'}</b>
                </p>
            )}
        />
    );
}

function displayCredentialCount(
    currentAmount: number | undefined,
    newAmount: number | undefined = 0
) {
    return (
        <PlainDetail
            title="Credentials"
            value={currentAmount}
            format={() => (
                <p className="mT5 mono body3">
                    Current amount of credentials: <b>{currentAmount}</b>
                    <br />
                    New amount of credentials: <b>{newAmount}</b>
                </p>
            )}
        />
    );
}

const toWrapperWithNote = (credDetails: CredentialDetails[]) => (
    cred: CredentialDeploymentInformation
): Omit<AddedCredential, 'index'> => ({
    value: cred,
    note: credDetails.find((d) => d[0] === cred.credId)?.[2],
});

function listCredentials(
    updateCredential: (credId: CredentialDetails) => void,
    isEditing: boolean,
    credentialIds?: CredentialDetails[]
) {
    return credentialIds?.map((credDetails) => {
        const [credId, status, note] = credDetails;

        let buttonText = 'Remove';
        let statusText = null;

        if (status === CredentialStatus.Added) {
            statusText = (
                <div className={clsx(styles.green, 'mB0 mono')}>Added</div>
            );
        } else if (status === CredentialStatus.Unchanged) {
            statusText = (
                <div className={clsx(styles.gray, 'mB0 mono')}>Unchanged</div>
            );
        } else if (status === CredentialStatus.Removed) {
            buttonText = 'Revert';
            statusText = (
                <div className={clsx(styles.red, 'mB0 mono')}>Removed</div>
            );
        } else if (status === CredentialStatus.Original) {
            statusText = <div className="mB0 mono">Original</div>;
        }

        return (
            <div key={credId} className={styles.credentialListElement}>
                <div className="mR20">
                    {buttonText && isEditing && (
                        <Button
                            size="tiny"
                            onClick={() => updateCredential(credDetails)}
                            disabled={status === CredentialStatus.Original}
                        >
                            {buttonText}
                        </Button>
                    )}
                </div>
                <div>
                    {note && <div className="mB5">{note}</div>}
                    <div className="textFaded body4">{credId}</div>
                </div>
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
    credential: (
        | InitialCredentialDeploymentValues
        | CredentialDeploymentValues
    ) & { credId: string };
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
    const externalCredentials = useSelector(externalCredentialsSelector);
    const ownCredentials = useSelector(credentialsSelector);
    const identities = useSelector(identitiesSelector);

    // const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [currentCredentials, setCurrentCredentials] = useState<
        AccountInfoCredential[] | undefined
    >();

    const handler = new UpdateAccountCredentialsHandler();

    const [newThreshold, setNewThreshold] = useState<number | undefined>();
    const [credentialIds, setCredentialIds] = useState<
        CredentialDetails[] | undefined
    >();
    const [newCredentials, setNewCredentials] = useState<
        CredentialDeploymentInformation[]
    >([]);
    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

    const newCredentialAmount =
        credentialIds?.filter(
            ([, status]) => status !== CredentialStatus.Removed
        ).length ?? 0;

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
            const cred = accountCredential[1].value;
            if (cred.type === 'initial') {
                return {
                    credentialIndex,
                    credential: {
                        ...cred.contents,
                        credId: cred.contents.regId,
                    },
                };
            }
            return { credentialIndex, credential: cred.contents };
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
                let note = externalCredentials.find((e) => e.credId === credId)
                    ?.note;

                if (!note) {
                    const ownCred = ownCredentials.find(
                        (c) => c.credId === credId
                    );

                    note = getNoteForOwnCredential(identities, ownCred);
                }

                return [credId, status, note];
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
                addedCredentials: assignIndices(
                    newCredentials.map(toWrapperWithNote(credentialIds ?? [])),
                    []
                ),
                removedCredIds:
                    credentialIds
                        ?.filter(
                            ([, status]) => status === CredentialStatus.Removed
                        )
                        .map(([id]) => id) ?? [],
                threshold: newThreshold || 1,
            };

            setFee(
                getUpdateCredentialsCost(
                    exchangeRate,
                    payload,
                    currentCredentials?.length ?? 0,
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
        currentCredentials,
    ]);

    useEffect(() => {
        if (accountInfo) {
            getCredentialInfo(accountInfo);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountInfo]);

    function updateCredentialStatus([removedId, status]: CredentialDetails) {
        if (status === CredentialStatus.Added) {
            setCredentialIds((currentCredentialIds) =>
                currentCredentialIds?.filter(([credId]) => credId !== removedId)
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
                currentCredentialIds?.map((item) =>
                    item[0] !== removedId ? item : [item[0], newStatus, item[2]]
                )
            );
        }
    }

    function renderCreateUpdate() {
        if (!newThreshold) {
            throwLoggedError('Unexpected missing threshold');
        }

        if (!account) {
            throwLoggedError('Unexpected missing account');
        }

        if (!expiryTime) {
            throwLoggedError('Unexpected missing expiry');
        }

        const usedIndices: number[] =
            currentCredentials
                ?.filter(({ credential }) => {
                    const { credId } = credential;
                    const currentStatus = credentialIds?.find(
                        ([id]) => credId === id
                    );
                    return (
                        currentStatus &&
                        currentStatus[1] === CredentialStatus.Unchanged
                    );
                })
                .map(({ credentialIndex }) => credentialIndex || 0) ?? [];

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
                        newCredentials.map(
                            toWrapperWithNote(credentialIds ?? [])
                        ),
                        usedIndices
                    )}
                    removedCredIds={
                        credentialIds
                            ?.filter(
                                ([, status]) =>
                                    status === CredentialStatus.Removed
                            )
                            .map(([id]) => id) ?? []
                    }
                    newThreshold={newThreshold}
                    currentCredentialAmount={currentCredentials?.length || 0}
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
        <MultiSignatureLayout pageTitle={handler.title} delegateScroll>
            <Columns
                className={styles.subtractContainerPadding}
                columnScroll
                divider
            >
                <Columns.Column header="Transaction details">
                    <div className={styles.columnContainer}>
                        <AccountDetail first title="Account" value={account} />
                        <DisplayEstimatedFee
                            className="mT10 mB40"
                            estimatedFee={estimatedFee}
                        />
                        {displaySignatureThreshold(
                            account?.signatureThreshold,
                            newThreshold
                        )}
                        {displayCredentialCount(
                            currentCredentials?.length,
                            credentialIds?.length
                        )}
                        {listCredentials(
                            updateCredentialStatus,
                            location ===
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL,
                            credentialIds
                        )}
                        <DisplayTransactionExpiryTime
                            expiryTime={expiryTime}
                            placeholder="To be determined"
                        />
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
                                        credentialIds={credentialIds ?? []}
                                        onAddCredential={(cred, note) => {
                                            setCredentialIds((cur = []) => [
                                                ...cur,
                                                [
                                                    cred.credId,
                                                    CredentialStatus.Added,
                                                    note,
                                                ],
                                            ]);
                                            setNewCredentials((cur) => [
                                                ...cur,
                                                cred,
                                            ]);
                                        }}
                                    />
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY
                                }
                                render={() => (
                                    <div>
                                        <DatePicker
                                            className="body2"
                                            label="Transaction expiry time"
                                            name="expiry"
                                            isInvalid={
                                                expiryTimeError !== undefined
                                            }
                                            error={expiryTimeError}
                                            value={expiryTime}
                                            onChange={setExpiryTime}
                                            minDate={new Date()}
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
                                        filter={(acc) =>
                                            !hasEncryptedBalance(acc)
                                        }
                                        onAccountClicked={onContinue}
                                        messageWhenEmpty="There are no accounts, which can update its credentials"
                                    />
                                )}
                            />
                        </Switch>
                        {showButton && (
                            <div className="flexColumn mT40">
                                {error && (
                                    <p className={styles.errorLabel}>{error}</p>
                                )}
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
