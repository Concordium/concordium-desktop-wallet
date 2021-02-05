import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../../constants/routes.json';
import PickProvider from './PickProvider';
import PickName from './PickName';
import GeneratePage from './GeneratePage';
import FinalPage from './FinalPage';
import { IdentityProvider } from '../../utils/types';

/**
 * The Last route is the default (because it has no path)
 */
export default function IdentityIssuancePage(): JSX.Element {
    const [provider, setProvider] = useState<IdentityProvider | undefined>();
    const [initialAccountName, setInitialAccountName] = useState<string>('');
    const [identityName, setIdentityName] = useState<string>('');

    return (
        <Switch>
            <Route
                path={routes.IDENTITYISSUANCE_PICKPROVIDER}
                render={() => <PickProvider setProvider={setProvider} />}
            />
            <Route
                path={routes.IDENTITYISSUANCE_EXTERNAL}
                render={() => {
                    if (provider) {
                        return (
                            <GeneratePage
                                identityName={identityName}
                                accountName={initialAccountName}
                                provider={provider}
                            />
                        );
                    }
                    throw new Error('Unexpected missing identity Provder!');
                }}
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
                    />
                )}
            />
        </Switch>
    );
}
