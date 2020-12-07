import React, { useEffect, useState, useRef } from 'react';
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
    getHTMLform,
} from '../utils/httpRequests';
// import { createIdentityRequestObject } from '../utils/rustInterface';
import { createIdentityRequestObjectAndPrivateData, createIdentityRequestObjectLedger } from '../utils/rustInterface.ts';
import identityjson from '../utils/IdentityObject.json';

const redirectUri = 'ConcordiumRedirectToken';

async function getIdentityLocation(provider, global) {
    const prfKey = "1b74286f32f91f03b1a0b5406610b7bba51cbf1fd2764835b8996f77294df9ae";
    const idCredSec = "0ae0d61e02d5346bb446d62b79c9e381f267820cb270fc989b4d5f1bd25fa5d8";
    const publicKeys = [
        {
            "schemeId": "Ed25519",
            "verifyKey": "4826d65ad0effc343945d2050e83596705a388c711073e909b2652766cb1371d"
        }
    ];
    const threshold = 1;
    const data = await createIdentityRequestObjectLedger(
        provider.ipInfo,
        provider.arsInfos,
        global,
        prfKey,
        idCredSec,
        publicKeys,
        threshold
    );
    console.log(data);
    const verifyLocation = await performIdObjectRequest(
        'http://localhost:8100/api/identity', // provider.metadata.issuanceStart,
        redirectUri,
        data.idObjectRequest
    );
    console.log(verifyLocation)
    return verifyLocation;
}

async function effect(provider, setLocation, iframeRef) {
    const global = await getGlobal();
    const location = await getIdentityLocation(provider, global);
    console.log(location);
    return new Promise((resolve, reject) => {
        setLocation(location)
        iframeRef.current.addEventListener('did-navigate', e => {
            console.log(e);
            const loc = e.url;
            if (loc.includes(redirectUri)) {
                resolve(loc.substring(loc.indexOf('=') + 1));
            }
        })
    });
}

async function after(dispatch, accountName, identityName, location) {
    const input = {
        identityName,
        accountName,
    };
    dispatch(addIdentity(input));
    confirmIdentity(dispatch, identityName, location);
    dispatch(push(routes.IDENTITYISSUANCE_FINAL));
}

export default function IdentityIssuanceExternal(): JSX.Element {
    const { index } = useParams();
    const dispatch = useDispatch();
    const providers = useSelector(providersSelector);
    const accountName = useSelector(accountNameSelector);
    const identityName = useSelector(identityNameSelector);
    const provider = providers[index];
    const [location, setLocation] = useState();
    const iframeRef = useRef(null);

    useEffect(() => {
        if (provider) {
            effect(provider, setLocation, iframeRef).then(location => after(dispatch, accountName, identityName, location));
        }
    }, [provider, setLocation, dispatch, accountName, identityName]);

    if (!location) {
        return <div />;
    }

    return <webview ref={iframeRef} className={styles.webview} src={location}/>
}
