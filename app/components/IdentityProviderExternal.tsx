import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { push } from 'connected-react-router';
import {
    loadProviders,
    providersSelector,
    accountNameSelector,
    identityNameSelector,
} from '../features/identityIssuanceSlice';
import { addIdentity, confirmIdentity } from '../features/accountsSlice';
import routes from '../constants/routes.json';
import styles from './IdentyIssuance.css';
import {
    getGlobal,
    performIdObjectRequest,
} from '../utils/httpRequests';
import { createIdentityRequestObject } from '../utils/rustInterface';
import identityjson from '../utils/IdentityObject.json';

async function getIdentityLocation(provider, global) {
    const data = await createIdentityRequestObject(
        provider.ipInfo,
        provider.arsInfos,
        global
    );
    const idObjectLocation = await performIdObjectRequest(
        'http://localhost:8100/api/identity', // provider.metadata.issuanceStart,
        'example.com',
        data
    );
    return idObjectLocation;
}

export default function IdentityIssuanceExternal(): JSX.Element {
    const { index } = useParams();
    const dispatch = useDispatch();
    const providers = useSelector(providersSelector);
    const accountName = useSelector(accountNameSelector);
    const identityName = useSelector(identityNameSelector);

    const provider = providers[index];

    useEffect(() => {
        if (provider) {
            getGlobal().then((global) =>
                getIdentityLocation(provider, global).then((location) => {
                    const input = {
                        identityName,
                        accountName,
                    };
                    dispatch(addIdentity(input));
                    confirmIdentity(dispatch, identityName, location);
                    dispatch(push(routes.IDENTITYISSUANCE_FINAL));
                })
            );
        }
    }, [provider, dispatch, accountName, identityName]);

    if (index >= providers.length) {
        return <div />;
    }

    return <div>Creating Identity</div>;
}
