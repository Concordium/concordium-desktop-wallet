import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../constants/routes.json';
import chooseProvider from './IdentityIssuanceChooseProvider';
import pickName from './IdentityIssuancePickName';
import external from './IdentityProviderExternal';
import finalPage from './IdentityIssuanceFinal';

export default function IdentityIssuance(): JSX.Element {
    return (
        <Switch>
            <Route
                path={routes.IDENTITYISSUANCE_PICKPROVIDER}
                component={chooseProvider}
            />
            <Route
                path={`${routes.IDENTITYISSUANCE_EXTERNAL}/:index`}
                component={external}
            />
            <Route path={routes.IDENTITYISSUANCE_FINAL} component={finalPage} />
            <Route path={routes.IDENTITYISSUANCE} component={pickName} />
        </Switch>
    );
}
