import React from 'react';
import { Route, RouteComponentProps, Switch, useLocation } from 'react-router';
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';
import AccountCredentialSummary from '../AccountCredentialSummary';
import SignCredential from '../SignCredential';
import PickAccount from '../PickAccount';
import PickIdentity from '../PickIdentity';

import generalStyles from '../GenerateCredential.module.scss';
import styles from './SplitViewRouter.module.scss';

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
            return 'Insert the account address for the account you want to generate credentials for and give it a name. You will be able to see some information on the account to the right.';
        case routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES:
            return 'You can choose to reveal one or more attributes on your credential. This is not necessary, and you can continue without doing so.';
        case routes.GENERATE_CREDENTIAL_SIGN:
            return 'Finish the process on your hardware wallet.';
        default:
            return '';
    }
}

interface Props extends RouteComponentProps {
    onNext(): void;
    resetChosenAttributes(): void;
}

export default function SplitViewRouter({
    onNext,
    resetChosenAttributes,
    location,
}: Props): JSX.Element {
    const { formState } = useFormContext();
    const { pathname } = useLocation();

    function nextPage(): void {
        if (pathname === routes.GENERATE_CREDENTIAL_PICKACCOUNT) {
            resetChosenAttributes();
        }

        onNext();
    }
    return (
        <div className={styles.grid}>
            <h2 className={styles.header}>{getHeader(location.pathname)}</h2>
            <p className={styles.description}>
                {getDescription(location.pathname)}
            </p>
            <AccountCredentialSummary className={styles.summary} />
            <Switch>
                <Route path={routes.GENERATE_CREDENTIAL_SIGN}>
                    <SignCredential onSigned={onNext} />
                </Route>
                <Route
                    path={[
                        routes.GENERATE_CREDENTIAL_PICKACCOUNT,
                        routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES,
                    ]}
                >
                    <PickAccount onNext={onNext} />
                </Route>
                <Route
                    path={routes.GENERATE_CREDENTIAL}
                    component={PickIdentity}
                />
            </Switch>
            {pathname !== routes.GENERATE_CREDENTIAL_SIGN && (
                <Button
                    className={clsx(
                        generalStyles.continueButton,
                        styles.button
                    )}
                    disabled={!formState.isValid}
                    onClick={nextPage}
                >
                    Continue
                </Button>
            )}
        </div>
    );
}
