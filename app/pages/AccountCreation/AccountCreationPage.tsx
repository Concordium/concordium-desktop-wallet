import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation, Redirect } from 'react-router-dom';
import routes from '~/constants/routes.json';
import { ChosenAttributes, ConfirmedIdentity } from '~/utils/types';
import PageLayout from '~/components/PageLayout';
import PickName from './PickName';
import PickIdentity from './PickIdentity';
import PickAttributes from './PickAttributes';
import GeneratePage from './GeneratePage/GeneratePage';
import FinalPage from './FinalPage';

import styles from './AccountCreation.module.scss';

function getSubtitle(location: string) {
    switch (location) {
        case routes.ACCOUNTCREATION_PICKIDENTITY:
            return 'Choose an identity';
        case routes.ACCOUNTCREATION_GENERATE:
            return 'Creating a new account';
        case routes.ACCOUNTCREATION_PICKATTRIBUTES:
            return 'Revealing Attributes';
        case routes.ACCOUNTCREATION_FINAL:
            return 'Your account';
        default:
            return 'Choose your account name';
    }
}

// The entrance into the flow is the last Route (which should have no path), otherwise the flow is controlled by the components themselves
export default function AccountCreationPage(): JSX.Element {
    const dispatch = useDispatch();
    const [accountName, setAccountName] = useState('');
    const [identity, setIdentity] = useState<ConfirmedIdentity | undefined>();
    const [chosenAttributes, setChosenAttributes] = useState<
        Array<keyof ChosenAttributes>
    >([]);
    const { pathname } = useLocation();

    function renderGeneratePage() {
        if (identity) {
            return (
                <GeneratePage
                    accountName={accountName}
                    attributes={chosenAttributes}
                    identity={identity}
                />
            );
        }

        return <Redirect to={routes.ACCOUNTS} />;
    }

    function renderPickAttributes() {
        if (identity) {
            return (
                <PickAttributes
                    identity={identity}
                    setChosenAttributes={setChosenAttributes}
                    chosenAttributes={chosenAttributes}
                />
            );
        }

        return <Redirect to={routes.ACCOUNTS} />;
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>
                    <span className={styles.titlePrefix}>New account</span>
                    {getSubtitle(useLocation().pathname)}
                </h1>
            </PageLayout.Header>
            <PageLayout.Container
                className={styles.container}
                closeRoute={routes.ACCOUNTS}
                disableBack={pathname === routes.ACCOUNTCREATION_FINAL}
            >
                <Switch>
                    <Route
                        path={routes.ACCOUNTCREATION_PICKIDENTITY}
                        render={() => (
                            <PickIdentity
                                resetChosenAttributes={() =>
                                    setChosenAttributes([])
                                }
                                setIdentity={setIdentity}
                                identity={identity}
                            />
                        )}
                    />
                    <Route
                        path={routes.ACCOUNTCREATION_FINAL}
                        component={FinalPage}
                    />
                    <Route
                        path={routes.ACCOUNTCREATION_GENERATE}
                        render={renderGeneratePage}
                    />
                    <Route
                        path={routes.ACCOUNTCREATION_PICKATTRIBUTES}
                        render={renderPickAttributes}
                    />
                    <Route
                        render={() => (
                            <PickName
                                name={accountName}
                                submitName={(name: string) => {
                                    setAccountName(name);
                                    dispatch(
                                        push(
                                            routes.ACCOUNTCREATION_PICKIDENTITY
                                        )
                                    );
                                }}
                            />
                        )}
                    />
                </Switch>
            </PageLayout.Container>
        </PageLayout>
    );
}
