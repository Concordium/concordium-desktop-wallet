import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../constants/routes.json';
import chooseProvider from './IdentityIssuanceChooseProvider';
import pickName from './IdentityIssuancePickName';
import generate from './IdentityIssuanceGenerate';
import finalPage from './IdentityIssuanceFinal';

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
                component={() => chooseProvider(setProvider)}
            />
            <Route
                path={routes.IDENTITYISSUANCE_EXTERNAL}
                component={() =>
                    generate(identityName, initialAccountName, provider)
                }
            />
            <Route path={routes.IDENTITYISSUANCE_FINAL} component={finalPage} />
            <Route
                component={() =>
                    pickName(setIdentityName, setInitialAccountName)
                }
            />
        </Switch>
    );
}
