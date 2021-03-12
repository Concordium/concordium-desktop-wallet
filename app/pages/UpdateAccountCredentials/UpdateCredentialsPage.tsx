import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Grid, List } from 'semantic-ui-react';
import Button from '../../cross-app-components/Button';
import {
    Account,
    Identity,
    CredentialDeploymentInformation,
} from '../../utils/types';
import PageLayout from '../../components/PageLayout';
import PickIdentity from '../GenerateCredential/PickIdentity';
import PickAccount from './PickAccount';
import AddCredential from './AddCredential';
import SubmitProposal from './SubmitProposal';
import ChangeSignatureThreshold from './ChangeSignatureThreshold';
import routes from '../../constants/routes.json';
import CreateUpdate from './CreateUpdate';
import { CredentialStatus } from './CredentialStatus';

const placeHolderText = 'To be determined';

function nextLocation(currentLocation: string) {
    switch (currentLocation) {
        case routes.UPDATE_ACCOUNT_CREDENTIALS:
        case routes.UPDATE_ACCOUNT_CREDENTIALS_PICKIDENTITY:
            return routes.UPDATE_ACCOUNT_CREDENTIALS_PICKACCOUNT;
        case routes.UPDATE_ACCOUNT_CREDENTIALS_PICKACCOUNT:
            return routes.UPDATE_ACCOUNT_CREDENTIALS_ADDCREDENTIAL;
        case routes.UPDATE_ACCOUNT_CREDENTIALS_ADDCREDENTIAL:
            return routes.UPDATE_ACCOUNT_CREDENTIALS_CHANGESIGNATURETHRESHOLD;
        case routes.UPDATE_ACCOUNT_CREDENTIALS_CHANGESIGNATURETHRESHOLD:
            return routes.UPDATE_ACCOUNT_CREDENTIALS_SIGN;
        case routes.UPDATE_ACCOUNT_CREDENTIALS_SIGN:
            return routes.MULTISIGTRANSACTIONS;
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
    if (!currentThreshold) {
        return placeHolderText;
    }
    return (
        <>
            <List.Item>Signature Threshold:</List.Item>
            <List.Item>
                Current amount of required signatures: {currentThreshold}
            </List.Item>
            <List.Item>
                New amount of required signatures: {newThreshold || '?'}
            </List.Item>
        </>
    );
}

function displayCredentialCount(
    currentAmount: number | undefined,
    newAmount: number
) {
    if (!currentAmount) {
        return placeHolderText;
    }
    return (
        <>
            <List.Item>Credentials:</List.Item>
            <List.Item>
                Current amount of credentials: {currentAmount}
            </List.Item>
            <List.Item>New amount of credentials: {newAmount}</List.Item>
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
                    right = <h2 color="green">Added</h2>;
                } else if (status === CredentialStatus.Unchanged) {
                    leftText = 'Remove';
                    right = <h2 color="grey">Unchanged</h2>;
                } else if (status === CredentialStatus.Removed) {
                    leftText = 'Revert';
                    right = <h2 color="red">Removed</h2>;
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

export default function GenerateCredential(): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [currentCredentialCount, setCurrentCredentialCount] = useState<
        number | undefined
    >();

    const [newThreshold, setNewThreshold] = useState<number | undefined>();
    const [credentialIds, setCredentialIds] = useState<
        [string, CredentialStatus][]
    >([]);
    const [newCredentials, setNewCredentials] = useState<
        CredentialDeploymentInformation[]
    >([]);

    useEffect(() => {
        if (account) {
            const currentCredentialIds = JSON.parse(account.credentials);
            setCurrentCredentialCount(currentCredentialIds.length);
            setNewThreshold(
                (previous) => account.signatureThreshold || previous
            );
            setCredentialIds(
                currentCredentialIds.map((id: string, index: number) => {
                    const status =
                        index === 0
                            ? CredentialStatus.Original
                            : CredentialStatus.Unchanged;
                    return [id, status];
                })
            );
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
            setNewCredentials((currentCredentials) =>
                currentCredentials.filter(({ credId }) => credId !== removedId)
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
        return (
            <CreateUpdate
                setReady={setReady}
                account={account}
                addedCredentials={newCredentials}
                removedCredIds={credentialIds
                    .filter(([, status]) => status === CredentialStatus.Removed)
                    .map(([id]) => id)}
                newThreshold={newThreshold}
            />
        );
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>
                    Multi Signature Transactions | Update Account Credentials
                </h1>
            </PageLayout.Header>
            <PageLayout.Container>
                <Grid columns="equal" centered>
                    <Grid.Row>
                        <Grid.Column>
                            <h2>Transaction Details</h2>
                            <List>
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
                                    currentCredentialCount,
                                    credentialIds.length
                                )}
                            </List>
                            {listCredentials(
                                credentialIds,
                                updateCredentialStatus,
                                location ===
                                    routes.UPDATE_ACCOUNT_CREDENTIALS_ADDCREDENTIAL
                            )}
                        </Grid.Column>
                        <Grid.Column>
                            <Switch>
                                <Route
                                    path={
                                        routes.UPDATE_ACCOUNT_CREDENTIALS_CHANGESIGNATURETHRESHOLD
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
                                        routes.UPDATE_ACCOUNT_CREDENTIALS_ADDCREDENTIAL
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
                                            setNewCredentials={
                                                setNewCredentials
                                            }
                                        />
                                    )}
                                />
                                <Route
                                    path={
                                        routes.UPDATE_ACCOUNT_CREDENTIALS_PICKACCOUNT
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
                                        routes.UPDATE_ACCOUNT_CREDENTIALS_SIGN
                                    }
                                    render={renderCreateUpdate}
                                />
                                <Route
                                    path={
                                        routes.UPDATE_ACCOUNT_CREDENTIALS_SEND
                                    }
                                    component={SubmitProposal}
                                />
                                <Route
                                    path={[
                                        routes.UPDATE_ACCOUNT_CREDENTIALS,
                                        routes.UPDATE_ACCOUNT_CREDENTIALS_PICKIDENTITY,
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
                                onClick={() => {
                                    setReady(false);
                                    dispatch(push(nextLocation(location)));
                                }}
                            >
                                Continue
                            </Button>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </PageLayout.Container>
        </PageLayout>
    );
}
