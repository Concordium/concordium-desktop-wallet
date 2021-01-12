import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../../constants/routes.json';
import PickProvider from './PickProvider';
import pickName from './PickName';
import generate from './GeneratePage';
import finalPage from './FinalPage';

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
                component={() => PickProvider(setProvider)}
            />
            <Route
                path={routes.IDENTITYISSUANCE_EXTERNAL}
                component={() =>
                    generate(identityName, initialAccountName, provider)
                }
            />
            <Route
                path={routes.IDENTITYISSUANCE_FINAL}
                component={() => finalPage(identityName, initialAccountName)}
            />
            <Route
                component={() =>
                    pickName(setIdentityName, setInitialAccountName)
                }
            />
        </Switch>
    );
}
