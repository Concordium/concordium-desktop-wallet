import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { push } from 'connected-react-router';
import {
    loadProviders,
    providersSelector,
    accountNameSelector,
    identityNameSelector,
} from '../features/IdentityIssuanceSlice';
import { addPendingIdentity, confirmIdentity } from '../features/IdentitySlice';
import { addPendingAccount, confirmAccount } from '../features/AccountSlice';
import routes from '../constants/routes.json';
import styles from './IdentyIssuance.css';
import {
    getGlobal,
    performIdObjectRequest,
    getIdObject,
} from '../utils/httpRequests';
import { createIdentityRequestObjectLedger } from '../utils/rustInterface';
import { getNextId } from '../database/IdentityDao';

const redirectUri = 'ConcordiumRedirectToken';

async function getIdentityLocation(provider, global, setText) {
    const id = await getNextId();
    const data = await createIdentityRequestObjectLedger(
        id,
        provider.ipInfo,
        provider.arsInfos,
        global,
        setText
    );
    console.log(data);
    const verifyLocation = await performIdObjectRequest(
        provider.metadata.issuanceStart,
        redirectUri,
        data.idObjectRequest
    );
    console.log(verifyLocation);
    return verifyLocation;
}

async function createIdentity(iframeRef) {
    // TODO: rename this
    return new Promise((resolve, reject) => {
        iframeRef.current.addEventListener('did-navigate', (e) => {
            console.log(e);
            const loc = e.url;
            if (loc.includes(redirectUri)) {
                resolve(loc.substring(loc.indexOf('=') + 1));
            }
        });
    });
}

async function confirmIdentityAndInitialAccount(
    dispatch: Dispatch,
    identityName: string,
    accountName: string,
    location: string
) {
    let token;
    try {
        token = await getIdObject(location);
        await confirmIdentity(dispatch, identityName, token.identityObject);
        await confirmAccount(
            dispatch,
            accountName,
            token.accountAddress,
            token.credential
        );
    } catch (err) {
        if (!token) {
            await rejectIdentity(identityName);
        } else {
            console.log(token); // TODO: Handle unable to save identity/account
        }
    }
}

async function generateIdentity(
    setLocation,
    setText,
    dispatch,
    provider,
    accountName,
    identityName,
    iframeRef
) {
    try {
        setText('Please Wait');
        const global = await getGlobal();
        const location = await getIdentityLocation(provider, global, setText);
        setLocation(location);
        const verifyLocation = await createIdentity(iframeRef);
        addPendingIdentity(dispatch, identityName, verifyLocation, provider);
        addPendingAccount(dispatch, accountName, identityName, 0);
        confirmIdentityAndInitialAccount(
            dispatch,
            identityName,
            accountName,
            verifyLocation
        );
        dispatch(push(routes.IDENTITYISSUANCE_FINAL));
    } catch (e) {
        console.log(`unable to create identity due to ${e.stack}`); // TODO: handle
    }
}

export default function IdentityIssuanceGenerate(): JSX.Element {
    const { index } = useParams();
    const dispatch = useDispatch();
    const providers = useSelector(providersSelector);
    const accountName = useSelector(accountNameSelector);
    const identityName = useSelector(identityNameSelector);
    const provider = providers[index];
    const [text, setText] = useState();
    const [location, setLocation] = useState();
    const iframeRef = useRef(null);

    useEffect(() => {
        if (provider) {
            generateIdentity(
                setLocation,
                setText,
                dispatch,
                provider,
                accountName,
                identityName,
                iframeRef
            );
        }
    }, [
        provider,
        setLocation,
        setText,
        dispatch,
        accountName,
        identityName,
        iframeRef,
    ]);

    if (!location) {
        return (
            <div>
                <h2>
                    <pre>{text}</pre>
                </h2>
            </div>
        );
    }

    return (
        <webview ref={iframeRef} className={styles.webview} src={location} />
    );
}
