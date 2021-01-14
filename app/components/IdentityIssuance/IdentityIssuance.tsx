import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../../constants/routes.json';
import PickProvider from './PickProvider';
import PickName from './PickName';
import GeneratePage from './GeneratePage';
import FinalPage from './FinalPage';

/**
 * The Last route is the default (because it has no path)
 */
export default function IdentityIssuance(): JSX.Element {
    const [provider, setProvider] = useState(undefined);
    const [initialAccountName, setInitialAccountName] = useState('');
    const [identityName, setIdentityName] = useState('');

    return (
        <Switch>
            <Route
                path={routes.IDENTITYISSUANCE_PICKPROVIDER}
                render={() => <PickProvider setProvider={setProvider} />}
            />
            <Route
                path={routes.IDENTITYISSUANCE_EXTERNAL}
                render={() => (
                    <GeneratePage
                        identityName={identityName}
                        initialAccountName={initialAccountName}
                        provider={provider}
                    />
                )}
            />
            <Route
                path={routes.IDENTITYISSUANCE_FINAL}
                render={() => (
                    <FinalPage
                        identityName={identityName}
                        initialAccountName={initialAccountName}
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
