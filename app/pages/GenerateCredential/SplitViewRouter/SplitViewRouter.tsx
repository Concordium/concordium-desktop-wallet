import React, { useState } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';
import AccountCredentialSummary from '../AccountCredentialSummary';
import SignCredential from '../SignCredential';
import PickAccount from '../PickAccount';
import PickIdentity from '~/components/PickIdentity';
import generateCredentialContext from '../GenerateCredentialContext';

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
        default:
            return '';
    }
}

interface Props extends RouteComponentProps {
    onNext(): void;
}

export default function SplitViewRouter({
    onNext,
    location,
}: Props): JSX.Element {
    const [
        accountValidationError,
        setAccountValidationError,
    ] = useState<string>();

    return (
        <div>
            <h2>{getHeader(location.pathname)}</h2>
            <p>{getDescription(location.pathname)}</p>
            <AccountCredentialSummary
                accountValidationError={accountValidationError}
            />
            <Switch>
                <Route
                    path={routes.GENERATE_CREDENTIAL_SIGN}
                    component={SignCredential}
                />
                <Route
                    path={[
                        routes.GENERATE_CREDENTIAL_PICKACCOUNT,
                        routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES,
                    ]}
                >
                    <PickAccount
                        setAccountValidationError={setAccountValidationError}
                        accountValidationError={accountValidationError}
                    />
                </Route>
                <Route path={routes.GENERATE_CREDENTIAL}>
                    <generateCredentialContext.Consumer>
                        {({
                            isReady: [, setReady],
                            identity: [, setIdentity],
                        }) => (
                            <PickIdentity
                                setReady={setReady}
                                setIdentity={setIdentity}
                            />
                        )}
                    </generateCredentialContext.Consumer>
                </Route>
            </Switch>
            <generateCredentialContext.Consumer>
                {({ isReady: [isReady] }) => (
                    <Button disabled={!isReady} onClick={onNext}>
                        Continue
                    </Button>
                )}
            </generateCredentialContext.Consumer>
        </div>
    );
}
