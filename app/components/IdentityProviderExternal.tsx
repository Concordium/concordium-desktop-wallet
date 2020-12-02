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
import { addIdentity } from '../features/accountsSlice';
import routes from '../constants/routes.json';
import styles from './IdentyIssuance.css';
import {
    getGlobal,
    performIdObjectRequest,
    getIdObject,
} from '../utils/httpRequests';
import { createIdentityRequestObject } from '../utils/rustInterface';
import identityjson from '../utils/IdentityObject.json';

async function getIdentity() {
    return identityjson.token;
}

async function getIdentityReal(provider, global) {
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
    console.log(idObjectLocation);
    const idObject = await getIdObject(idObjectLocation).catch(console.warn);
    console.log(idObject);
    return idObject;
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
                getIdentity(provider, global).then((id) => {
                    console.log(accountName);
                    const input = {
                        identityName,
                        identityObject: id.identityObject,
                        accountName,
                        accountAddress: id.accountAddress,
                    };
                    dispatch(addIdentity(input));
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
