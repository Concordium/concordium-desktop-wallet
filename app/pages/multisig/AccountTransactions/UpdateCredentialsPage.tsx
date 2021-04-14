import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Grid, List } from 'semantic-ui-react';
import { credentialsSelector } from '~/features/CredentialSlice';
import Button from '~/cross-app-components/Button';
import {
    Credential,
    Account,
    Identity,
    CredentialDeploymentInformation,
    TransactionKindId,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import AddCredential from './AddCredential';
import ChangeSignatureThreshold from './ChangeSignatureThreshold';
import routes from '~/constants/routes.json';
import CreateUpdate from './CreateUpdate';
import { CredentialStatus } from './CredentialStatus';
import styles from './UpdateAccountCredentials.module.scss';
import ConfirmPage from './ConfirmPage';
import UpdateAccountCredentialsHandler from '~/utils/updates/UpdateAccountCredentialsHandler';
import Columns from '~/components/Columns';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';

const placeHolderText = 'To be determined';

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
            return '';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CONFIRM:
            return '';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION:
            return 'Signature and Hardware Wallet';
        default:
            throw new Error('unknown location');
    }
}

function displayAccount(account: Account | undefined) {
    return (
        <>
            <List.Item>Account:</List.Item>
            <List.Item>
                <b>
                    {account ? account.name : 'Choose an account on the right'}
                </b>
            </List.Item>
        </>
    );
}

function displaySignatureThreshold(
    currentThreshold: number | undefined,
    newThreshold: number | undefined
) {
    let body;
    if (!currentThreshold) {
        body = <List.Item>{placeHolderText}</List.Item>;
    } else {
        body = (
            <>
                <List.Item>
                    Current amount of required signatures: {currentThreshold}
                </List.Item>
                <List.Item>
                    New amount of required signatures: {newThreshold || '?'}
                </List.Item>
            </>
        );
    }
    return (
        <>
            <List.Item>Signature Threshold:</List.Item>
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
        body = <List.Item>{placeHolderText}</List.Item>;
    } else {
        body = (
            <>
                <List.Item>
                    Current amount of credentials: {currentAmount}
                </List.Item>
                <List.Item>New amount of credentials: {newAmount}</List.Item>
            </>
        );
    }
    return (
        <>
            <List.Item>Credentials:</List.Item>
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
    return (
        <Grid columns="3">
            {credentialIds.map(([credId, status]) => {
                let leftText = null;
                let right = null;
                if (status === CredentialStatus.Added) {
                    leftText = 'Remove';
                    right = <h2 className={styles.green}>Added</h2>;
                } else if (status === CredentialStatus.Unchanged) {
                    leftText = 'Remove';
                    right = <h2 className={styles.gray}>Unchanged</h2>;
                } else if (status === CredentialStatus.Removed) {
                    leftText = 'Revert';
                    right = <h2 className={styles.red}>Removed</h2>;
                } else if (status === CredentialStatus.Original) {
                    right = <h2>Original</h2>;
                }
                return (
                    <Grid.Row key={credId}>
                        <Grid.Column>
                            {leftText && isEditing ? (
                                <Button
                                    onClick={() =>
                                        updateCredential([credId, status])
                                    }
                                >
                                    {leftText}
                                </Button>
                            ) : null}
                        </Grid.Column>
                        <Grid.Column>
                            <h5>{credId}</h5>
                        </Grid.Column>
                        <Grid.Column>{right}</Grid.Column>
                    </Grid.Row>
                );
            })}
        </Grid>
    );
}

/**
 * This component controls the flow of creating a updateAccountCredential transaction.
 * It contains the logic for displaying the current parameters.
 */
export default function UpdateCredentialPage(): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;
    const credentials = useSelector(credentialsSelector);

    const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [currentCredentials, setCurrentCredentials] = useState<Credential[]>(
        []
    );

    const handler = new UpdateAccountCredentialsHandler();

    const [newThreshold, setNewThreshold] = useState<number | undefined>();
    const [credentialIds, setCredentialIds] = useState<
        [string, CredentialStatus][]
    >([]);
    const [newCredentials, setNewCredentials] = useState<
        CredentialDeploymentInformation[]
    >([]);
    useEffect(() => {
        if (account) {
            const credentialsOfAccount = credentials.filter(
                (cred) =>
                    cred.accountAddress === account.address &&
                    (cred.credentialIndex || cred.credentialIndex === 0)
            );
            setCurrentCredentials(credentialsOfAccount);
            setNewThreshold(
                (previous) => account.signatureThreshold || previous
            );
            setCredentialIds(
                credentialsOfAccount.map(({ credId, credentialIndex }) => {
                    const status =
                        credentialIndex === 0
                            ? CredentialStatus.Original
                            : CredentialStatus.Unchanged;
                    return [credId, status];
                })
            );
        }
    }, [account, credentials]);

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

    function renderConfirmPage() {
        if (!account?.signatureThreshold) {
            throw new Error('Unexpected missing account/signatureThreshold');
        }
        return (
            <ConfirmPage
                setReady={setReady}
                currentThreshold={account.signatureThreshold}
                currentCredentialAmount={currentCredentials.length}
                newCredentialAmount={
                    credentialIds.filter(
                        ([, status]) => status !== CredentialStatus.Removed
                    ).length
                }
                newThreshold={newThreshold}
            />
        );
    }

    function renderCreateUpdate() {
        if (!newThreshold) {
            throw new Error('Unexpected missing threshold');
        }
        const usedIndices: number[] = currentCredentials
            .filter(({ credId }) => {
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
            <CreateUpdate
                account={account}
                addedCredentials={assignIndices(newCredentials, usedIndices)}
                removedCredIds={credentialIds
                    .filter(([, status]) => status === CredentialStatus.Removed)
                    .map(([id]) => id)}
                newThreshold={newThreshold}
                currentCredentialAmount={currentCredentials.length}
                primaryCredential={currentCredentials[0]}
            />
        );
    }

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Update Account Credentials"
            stepTitle="Transaction Proposal - Update Account Credentials"
        >
            <Columns columnClassName={styles.columns} divider>
                <Columns.Column header="Transaction Details">
                    <List relaxed>
                        <List.Item>Identity:</List.Item>
                        <List.Item>
                            <b>
                                {identity
                                    ? identity.name
                                    : 'Choose an ID on the right'}
                            </b>
                        </List.Item>
                        {displayAccount(account)}
                        {displaySignatureThreshold(
                            account?.signatureThreshold,
                            newThreshold
                        )}
                        {displayCredentialCount(
                            currentCredentials.length,
                            credentialIds.length
                        )}
                    </List>
                    {listCredentials(
                        credentialIds,
                        updateCredentialStatus,
                        location ===
                            routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL
                    )}
                </Columns.Column>
                <Columns.Column header={subTitle(location)}>
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
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CONFIRM
                            }
                            render={renderConfirmPage}
                        />
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL
                            }
                            render={() => (
                                <AddCredential
                                    setReady={setReady}
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
                            path={[
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION,
                            ]}
                            render={() => (
                                <PickIdentity
                                    setReady={setReady}
                                    setIdentity={setIdentity}
                                />
                            )}
                        />
                    </Switch>
                    <Button
                        disabled={!isReady}
                        className={styles.continueButton}
                        onClick={() => {
                            setReady(false);

                            dispatch(
                                push({
                                    pathname: handler.creationLocationHandler(
                                        location
                                    ),
                                    state: TransactionKindId.Update_credentials,
                                })
                            );
                        }}
                    >
                        Continue
                    </Button>
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}
