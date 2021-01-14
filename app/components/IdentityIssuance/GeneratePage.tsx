import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import {
    addPendingIdentity,
    confirmIdentity,
} from '../../features/IdentitySlice';
import {
    addPendingAccount,
    confirmInitialAccount,
} from '../../features/AccountSlice';
import routes from '../../constants/routes.json';
import styles from './IdentyIssuance.css';
import {
    getGlobal,
    performIdObjectRequest,
    getIdObject,
} from '../../utils/httpRequests';
import { createIdentityRequestObjectLedger } from '../../utils/rustInterface';
import { getNextId } from '../../database/IdentityDao';
import { IdentityProvider } from '../../utils/types';

const redirectUri = 'ConcordiumRedirectToken';

async function createIdentityObjectRequest(id, provider, setText) {
    const global = await getGlobal();
    const data = await createIdentityRequestObjectLedger(
        id,
        provider.ipInfo,
        provider.arsInfos,
        global,
        setText
    );
    return {
        idObjectRequest: data.idObjectRequest,
        randomness: data.randomness,
    };
}

async function handleIdentityProviderLocation(iframeRef) {
    return new Promise((resolve) => {
        iframeRef.current.addEventListener('did-navigate', (e) => {
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
        await confirmInitialAccount(
            dispatch,
            accountName,
            token.accountAddress,
            token.credential
        );
    } catch (err) {
        if (!token) {
            await rejectIdentity(identityName);
        } else {
            console.log(err);
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
        const identityId = await getNextId();
        const {
            idObjectRequest,
            randomness,
        } = await createIdentityObjectRequest(identityId, provider, setText);
        const IdentityProviderLocation = await performIdObjectRequest(
            provider.metadata.issuanceStart,
            redirectUri,
            idObjectRequest
        );
        setLocation(IdentityProviderLocation);
        const identityObjectLocation = await handleIdentityProviderLocation(
            iframeRef
        );
        // TODO: Handle the case where the app closes before we are able to save pendingIdentity
        await addPendingIdentity(
            dispatch,
            identityName,
            identityObjectLocation,
            provider,
            randomness
        );
        await addPendingAccount(dispatch, accountName, identityId, 0); // TODO: can we add the address already here?
        confirmIdentityAndInitialAccount(
            dispatch,
            identityName,
            accountName,
            identityObjectLocation
        );
        dispatch(push(routes.IDENTITYISSUANCE_FINAL));
    } catch (e) {
        console.log(`unable to create identity due to ${e.stack}`); // TODO: handle
    }
}

interface Props {
    identityName: string;
    accountName: string;
    provider: IdentityProvider;
}

export default function IdentityIssuanceGenerate({
    identityName,
    accountName,
    provider,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [text, setText] = useState();
    const [location, setLocation] = useState();
    const iframeRef = useRef(null);

    useEffect(() => {
        generateIdentity(
            setLocation,
            setText,
            dispatch,
            provider,
            accountName,
            identityName,
            iframeRef
        );
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
