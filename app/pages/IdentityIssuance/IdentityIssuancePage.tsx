import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Switch, Route, useLocation, useRouteMatch } from 'react-router-dom';
import { Location } from 'history';
import routes from '~/constants/routes.json';
import { IdentityProvider } from '~/utils/types';
import ErrorModal from '~/components/SimpleErrorModal';
import PageLayout from '~/components/PageLayout';
import PickProvider from './PickProvider';
import PickName from './PickName/PickName';
import ExternalIssuance from './ExternalIssuance';
import FinalPage from './FinalPage';
import NavigationBlock from './NavigationBlock';

import styles from './IdentityIssuance.module.scss';

function getSubtitle(location: string) {
    switch (location) {
        case routes.IDENTITYISSUANCE_PICKPROVIDER:
            return 'Choose an identity provider';
        case routes.IDENTITYISSUANCE_EXTERNAL:
            return 'Issuance flow';
        case routes.IDENTITYISSUANCE_FINAL:
            return 'Your identity';
        default:
            return 'Choose your names';
    }
}

interface LocationState {
    identityName?: string;
}

/**
 * The Last route is the default (because it has no path)
 */
export default function IdentityIssuancePage(): JSX.Element {
    const dispatch = useDispatch();

    const { pathname, state } = useLocation<LocationState>();
    const { path } = useRouteMatch();

    const [provider, setProvider] = useState<IdentityProvider | undefined>();
    const [identityName, setIdentityName] = useState<string>(
        state?.identityName || ''
    );

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [isSigning, setIsSigning] = useState(false);

    function activateModal(message: string) {
        setModalMessage(message);
        setErrorModalOpen(true);
    }

    function renderExternalIssuance() {
        if (provider) {
            return (
                <ExternalIssuance
                    identityName={identityName}
                    provider={provider}
                    onError={activateModal}
                />
            );
        }
        window.log.warn(
            'Unexpected missing identity provider in IdentityIssuance.'
        );
        throw new Error('Unexpected missing identity provider!');
    }

    function shouldPromptOnNavigation(location: Location) {
        // Allow direct navigation from any route but the external issuance page.
        if (
            (pathname !== routes.IDENTITYISSUANCE_EXTERNAL || errorModalOpen) &&
            !isSigning
        ) {
            return false;
        }

        // Allow direct navigation between sub routes.
        return !location.pathname.startsWith(path);
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>
                    <span className="pageTitlePrefix">New identity</span>
                    {getSubtitle(useLocation().pathname)}
                </h1>
            </PageLayout.Header>
            <ErrorModal
                header="Unable to create identity"
                content={modalMessage}
                show={errorModalOpen}
                onClick={() => dispatch(push(routes.IDENTITIES))}
            />
            <NavigationBlock shouldPrompt={shouldPromptOnNavigation} />
            <PageLayout.Container
                closeRoute={routes.IDENTITIES}
                padding="both"
                className={styles.container}
                disableBack={pathname === routes.IDENTITYISSUANCE_FINAL}
            >
                <Switch>
                    <Route
                        path={routes.IDENTITYISSUANCE_PICKPROVIDER}
                        render={() => (
                            <PickProvider
                                setProvider={setProvider}
                                onError={activateModal}
                                provider={provider}
                                setIsSigning={setIsSigning}
                            />
                        )}
                    />
                    <Route
                        path={routes.IDENTITYISSUANCE_EXTERNAL}
                        render={renderExternalIssuance}
                    />
                    <Route
                        path={routes.IDENTITYISSUANCE_FINAL}
                        component={FinalPage}
                    />
                    <Route
                        render={() => (
                            <PickName
                                setIdentityName={setIdentityName}
                                identity={identityName}
                            />
                        )}
                    />
                </Switch>
            </PageLayout.Container>
        </PageLayout>
    );
}
