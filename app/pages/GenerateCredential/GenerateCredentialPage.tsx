import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Grid, List } from 'semantic-ui-react';
import Button from '~/cross-app-components/Button';
import { Identity } from '~/utils/types';
import PageLayout from '~/components/PageLayout';
import PickIdentity from './PickIdentity';
import ExportCredential from './ExportCredential';
import PickAccount from './PickAccount';
import SignCredential from './SignCredential';
import routes from '~/constants/routes.json';
import AccountCredentialSummary from './AccountCredentialSummary';
import { CredentialBlob } from './types';

function nextLocation(currentLocation: string) {
    switch (currentLocation) {
        case routes.GENERATE_CREDENTIAL:
        case routes.GENERATE_CREDENTIAL_PICKIDENTITY:
            return routes.GENERATE_CREDENTIAL_PICKACCOUNT;
        case routes.GENERATE_CREDENTIAL_PICKACCOUNT:
        case routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES:
            return routes.GENERATE_CREDENTIAL_SIGN;
        case routes.GENERATE_CREDENTIAL_SIGN:
            return routes.GENERATE_CREDENTIAL_EXPORT;
        case routes.GENERATE_CREDENTIAL_EXPORT:
            return routes.MULTISIGTRANSACTIONS;
        default:
            throw new Error('unknown location');
    }
}

function getHeader(currentLocation: string) {
    switch (currentLocation) {
        case routes.GENERATE_CREDENTIAL:
        case routes.GENERATE_CREDENTIAL_PICKIDENTITY:
            return 'Choose which identity';
        case routes.GENERATE_CREDENTIAL_PICKACCOUNT:
            return 'Insert account address';
        case routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES:
            return 'Reveal attributes';
        case routes.GENERATE_CREDENTIAL_SIGN:
            return 'Generate your credentials';
        case routes.GENERATE_CREDENTIAL_EXPORT:
            return 'Export your credentials';
        default:
            return '';
    }
}

function getDescription(currentLocation: string) {
    switch (currentLocation) {
        case routes.GENERATE_CREDENTIAL:
        case routes.GENERATE_CREDENTIAL_PICKIDENTITY:
            return 'To generate new credentials, you must first choose an identity.';
        case routes.GENERATE_CREDENTIAL_PICKACCOUNT:
            return 'Insert the account address for the account you want to generate credentials for. You will be able to see some information on the account to the right.';
        case routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES:
            return 'You can choose to reveal one or more attributes on your credential. This is not necessary, and you can continue without doing so.';
        case routes.GENERATE_CREDENTIAL_SIGN:
            return 'Generate your credentials';
        case routes.GENERATE_CREDENTIAL_EXPORT:
            return 'Export your credentials';
        default:
            return '';
    }
}

/**
 * Controls the flow of generating a credential. Contains the logic of the left
 * column, where the parameters are displayed, and the address is entered.
 */
export default function GenerateCredential(): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    const [credentialBlob, setCredential] = useState<
        CredentialBlob | undefined
    >();
    const [isReady, setReady] = useState(false);
    const [address, setAddress] = useState('');
    const [attributes, setAttributes] = useState<string[]>([]);
    const [identity, setIdentity] = useState<Identity | undefined>();

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Generate Account Credentials</h1>
            </PageLayout.Header>
            <PageLayout.Container>
                <Grid columns="equal" centered>
                    <Grid.Row>
                        <h2>{getHeader(location)}</h2>
                    </Grid.Row>
                    <Grid.Row>{getDescription(location)}</Grid.Row>
                    <Grid.Row>
                        <Switch>
                            <Route
                                path={routes.GENERATE_CREDENTIAL_EXPORT}
                                render={() => (
                                    <List>
                                        <AccountCredentialSummary
                                            identity={identity}
                                            address={address}
                                            setAddress={setAddress}
                                            credential={
                                                credentialBlob?.credential
                                            }
                                            Button={() => (
                                                <ExportCredential
                                                    credentialBlob={
                                                        credentialBlob
                                                    }
                                                    setReady={setReady}
                                                />
                                            )}
                                        />
                                        <Button
                                            disabled={!isReady}
                                            onClick={() => {
                                                setReady(false);
                                                dispatch(
                                                    push(nextLocation(location))
                                                );
                                            }}
                                        >
                                            Continue
                                        </Button>
                                    </List>
                                )}
                            />
                            <Route
                                render={() => (
                                    <>
                                        <Grid.Column>
                                            <AccountCredentialSummary
                                                identity={identity}
                                                address={address}
                                                setAddress={setAddress}
                                                credential={
                                                    credentialBlob?.credential
                                                }
                                            />
                                            <Button
                                                disabled={!isReady}
                                                onClick={() => {
                                                    setReady(false);
                                                    dispatch(
                                                        push(
                                                            nextLocation(
                                                                location
                                                            )
                                                        )
                                                    );
                                                }}
                                            >
                                                Continue
                                            </Button>
                                        </Grid.Column>
                                        <Grid.Column>
                                            <Switch>
                                                <Route
                                                    path={
                                                        routes.GENERATE_CREDENTIAL_SIGN
                                                    }
                                                    render={() => (
                                                        <SignCredential
                                                            setReady={setReady}
                                                            identity={identity}
                                                            address={address}
                                                            setCredential={
                                                                setCredential
                                                            }
                                                            attributes={
                                                                attributes
                                                            }
                                                        />
                                                    )}
                                                />
                                                <Route
                                                    path={[
                                                        routes.GENERATE_CREDENTIAL_PICKACCOUNT,
                                                        routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES,
                                                    ]}
                                                    render={() => (
                                                        <PickAccount
                                                            isReady={isReady}
                                                            setReady={setReady}
                                                            address={address}
                                                            setChosenAttributes={
                                                                setAttributes
                                                            }
                                                            identity={identity}
                                                        />
                                                    )}
                                                />
                                                <Route
                                                    path={
                                                        routes.GENERATE_CREDENTIAL
                                                    }
                                                    render={() => (
                                                        <PickIdentity
                                                            setReady={setReady}
                                                            setIdentity={
                                                                setIdentity
                                                            }
                                                        />
                                                    )}
                                                />
                                            </Switch>
                                        </Grid.Column>
                                    </>
                                )}
                            />
                        </Switch>
                    </Grid.Row>
                </Grid>
            </PageLayout.Container>
        </PageLayout>
    );
}
