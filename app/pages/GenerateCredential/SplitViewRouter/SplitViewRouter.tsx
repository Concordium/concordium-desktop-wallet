import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';
import AccountCredentialSummary from '../AccountCredentialSummary';
import SignCredential from '../SignCredential';
import PickAccount from '../PickAccount';
import PickIdentity from '~/components/PickIdentity';
import generateCredentialContext from '../GenerateCredentialContext';

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
            return 'Insert the account address for the account you want to generate credentials for. You will be able to see some information on the account to the right.';
        case routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES:
            return 'You can choose to reveal one or more attributes on your credential. This is not necessary, and you can continue without doing so.';
        case routes.GENERATE_CREDENTIAL_SIGN:
            return 'Generate your credentials';
        default:
            return '';
    }
}

function ScrollContainer({ children }: PropsWithChildren<unknown>) {
    const [overflowing, setOverflowing] = useState(false);
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onResize = () => {
            setOverflowing(
                (inner.current?.clientHeight ?? 0) >
                    (outer.current?.clientHeight ?? 0)
            );
        };
        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div className={styles.scrollContainer}>
            <div className={clsx(!overflowing && styles.centered)} ref={outer}>
                <div ref={inner}>{children}</div>
            </div>
        </div>
    );
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
        <div className={styles.grid}>
            <h2 className={styles.header}>{getHeader(location.pathname)}</h2>
            <p className={styles.description}>
                {getDescription(location.pathname)}
            </p>
            <AccountCredentialSummary
                className={styles.summary}
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
                            <ScrollContainer>
                                <PickIdentity
                                    className={styles.pickIdentity}
                                    setReady={setReady}
                                    setIdentity={setIdentity}
                                />
                            </ScrollContainer>
                        )}
                    </generateCredentialContext.Consumer>
                </Route>
            </Switch>
            <generateCredentialContext.Consumer>
                {({ isReady: [isReady] }) => (
                    <Button
                        className={styles.button}
                        disabled={!isReady}
                        onClick={onNext}
                    >
                        Continue
                    </Button>
                )}
            </generateCredentialContext.Consumer>
        </div>
    );
}
