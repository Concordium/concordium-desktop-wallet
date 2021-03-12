import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Grid, Card, List } from 'semantic-ui-react';
import Identicon from 'react-identicons';
import Button from '../../cross-app-components/Button';
import { Identity, CredentialDeploymentInformation } from '../../utils/types';
import Form from '../../components/Form';
import PageLayout from '../../components/PageLayout';
import PickIdentity from './PickIdentity';
import ExportCredential from './ExportCredential';
import PickAccount from './PickAccount';
import SignCredential from './SignCredential';
import routes from '../../constants/routes.json';

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

    const [credential, setCredential] = useState<
        CredentialDeploymentInformation | undefined
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
                        <Grid.Column>
                            <Card>
                                <Card.Header>
                                    Account Credential Summary
                                </Card.Header>
                                <Card.Content textAlign="center">
                                    <List>
                                        <List.Item>Identity:</List.Item>
                                        <List.Item>
                                            <b>
                                                {identity
                                                    ? identity.name
                                                    : 'Choose an ID on the right'}
                                            </b>
                                        </List.Item>
                                        <List.Item>Account:</List.Item>
                                        <List.Item>
                                            {location ===
                                            routes.GENERATE_CREDENTIAL_PICKACCOUNT ? (
                                                <Form onSubmit={() => {}}>
                                                    <Form.TextArea
                                                        name="address"
                                                        placeholder="Paste the account address here"
                                                        value={address}
                                                        onChange={(e) => {
                                                            const newAddress =
                                                                e.target.value;
                                                            setAddress(
                                                                newAddress
                                                            );
                                                        }}
                                                    />
                                                </Form>
                                            ) : (
                                                <b>
                                                    {' '}
                                                    {address ||
                                                        'To be determined'}{' '}
                                                </b>
                                            )}
                                        </List.Item>
                                        <List.Item>Identicon:</List.Item>
                                        <List.Item>
                                            {credential ? (
                                                <Identicon
                                                    string={JSON.stringify(
                                                        credential
                                                    )}
                                                    size={64}
                                                />
                                            ) : (
                                                <b>To be generated</b>
                                            )}
                                        </List.Item>
                                    </List>
                                </Card.Content>
                            </Card>
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
                        <Grid.Column>
                            <Switch>
                                <Route
                                    path={routes.GENERATE_CREDENTIAL_SIGN}
                                    render={() => (
                                        <SignCredential
                                            setReady={setReady}
                                            identity={identity}
                                            address={address}
                                            setCredential={setCredential}
                                            attributes={attributes}
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
                                            setChosenAttributes={setAttributes}
                                            identity={identity}
                                        />
                                    )}
                                />
                                <Route
                                    path={routes.GENERATE_CREDENTIAL_EXPORT}
                                    render={() => (
                                        <ExportCredential
                                            setReady={setReady}
                                            credential={credential}
                                        />
                                    )}
                                />
                                <Route
                                    path={routes.GENERATE_CREDENTIAL}
                                    render={() => (
                                        <PickIdentity
                                            setReady={setReady}
                                            setIdentity={setIdentity}
                                        />
                                    )}
                                />
                            </Switch>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </PageLayout.Container>
        </PageLayout>
    );
}
