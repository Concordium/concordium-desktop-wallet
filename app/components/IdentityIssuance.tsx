import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import {
    loadProviders,
    providersSelector,
} from '../features/identityIssuanceSlice';
import routes from '../constants/routes.json';
import chooseProvider from './IdentityIssuanceChooseProvider.tsx';
import pickName from './IdentityIssuancePickName.tsx';
import external from './IdentityProviderExternal.tsx';


export default function f() {
    return (
        <Switch>
            <Route path={routes.IDENTITYISSUANCE_PICKPROVIDER}  component={chooseProvider} />
            <Route path={routes.IDENTITYISSUANCE_EXTERNAL + '/:index'}  component={external} />
            <Route path={routes.IDENTITYISSUANCE}  component={pickName} />
        </Switch>
    );
}
