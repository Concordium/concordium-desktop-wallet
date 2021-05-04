import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Switch, Route, useLocation } from 'react-router-dom';
import routes from '~/constants/routes.json';
import { IdentityProvider } from '~/utils/types';
import ErrorModal from '~/components/SimpleErrorModal';
import PageLayout from '~/components/PageLayout';
import PickProvider from './PickProvider';
import PickName from './PickName/PickName';
import GeneratePage from './GeneratePage';
import FinalPage from './FinalPage';

import styles from './IdentityIssuance.module.scss';

function getSubtitle(location: string) {
    switch (location) {
        case routes.IDENTITYISSUANCE_PICKPROVIDER:
            return 'Choose an identity provider';
        case routes.IDENTITYISSUANCE_EXTERNAL:
            return 'Issuance flow';
        case routes.IDENTITYISSUANCE_FINAL:
            return 'Your identity and initial account';
        default:
            return 'Choose your names';
    }
}

/**
 * The Last route is the default (because it has no path)
 */
export default function IdentityIssuancePage(): JSX.Element {
    const dispatch = useDispatch();

    const [provider, setProvider] = useState<IdentityProvider | undefined>();
    const [initialAccountName, setInitialAccountName] = useState<string>('');
    const [identityName, setIdentityName] = useState<string>('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');

    function activateModal(message: string) {
        setModalMessage(message);
        setModalOpen(true);
    }

    function renderGeneratePage() {
        if (provider) {
            return (
                <GeneratePage
                    identityName={identityName}
                    accountName={initialAccountName}
                    provider={provider}
                    onError={activateModal}
                />
            );
        }
        throw new Error('Unexpected missing identity Provider!');
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>New identity | {getSubtitle(useLocation().pathname)}</h1>
            </PageLayout.Header>
            <ErrorModal
                header="Unable to create identity"
                content={modalMessage}
                show={modalOpen}
                onClick={() => dispatch(push(routes.IDENTITIES))}
            />
            <PageLayout.Container
                closeRoute={routes.IDENTITIES}
                padding="both"
                className={styles.container}
            >
                <Switch>
                    <Route
                        path={routes.IDENTITYISSUANCE_PICKPROVIDER}
                        render={() => (
                            <PickProvider
                                setProvider={setProvider}
                                onError={activateModal}
                            />
                        )}
                    />
                    <Route
                        path={routes.IDENTITYISSUANCE_EXTERNAL}
                        render={renderGeneratePage}
                    />
                    <Route
                        path={routes.IDENTITYISSUANCE_FINAL}
                        render={() => (
                            <FinalPage
                                identityName={identityName}
                                accountName={initialAccountName}
                            />
                        )}
                    />
                    <Route
                        render={() => (
                            <PickName
                                setIdentityName={setIdentityName}
                                setAccountName={setInitialAccountName}
                                account={initialAccountName}
                                identity={identityName}
                            />
                        )}
                    />
                </Switch>
            </PageLayout.Container>
        </PageLayout>
    );
}
