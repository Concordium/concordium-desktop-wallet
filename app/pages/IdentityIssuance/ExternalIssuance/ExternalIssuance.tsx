import React, { useState, useRef, RefObject, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Prompt, Redirect, useLocation } from 'react-router';
import { addPendingIdentity } from '~/features/IdentitySlice';
import { addPendingAccount } from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import {
    getPromise,
    getResponseBody,
    performIdObjectRequest,
} from '~/utils/httpRequests';
import { IdentityProvider, Dispatch, SignedIdRequest } from '~/utils/types';
import { confirmIdentityAndInitialAccount } from '~/utils/IdentityStatusPoller';
import Loading from '~/cross-app-components/Loading';

import generalStyles from '../IdentityIssuance.module.scss';
import styles from './ExternalIssuance.module.scss';

const redirectUri = 'ConcordiumRedirectToken';

async function getBody(url: string) {
    const response = await getPromise(url);
    return getResponseBody(response);
}

/**
 *   This function puts a listener on the given iframeRef, and when it navigates (due to a redirect http response) it resolves,
 *   and returns the location, which was redirected to.
 */
async function handleIdentityProviderLocation(
    iframeRef: RefObject<HTMLIFrameElement>
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!iframeRef.current) {
            reject(new Error('Unexpected missing reference to webView.'));
        } else {
            iframeRef.current.addEventListener(
                'did-navigate',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async (e: any) => {
                    const loc = e.url;
                    if (loc.includes(redirectUri)) {
                        resolve(loc.substring(loc.indexOf('=') + 1));
                    } else if (e.httpResponseCode !== 200) {
                        reject(new Error(await getBody(e.url)));
                    }
                }
            );
        }
    });
}

async function generateIdentity(
    idObjectRequest: string,
    randomness: string,
    identityNumber: number,
    setLocation: (location: string) => void,
    dispatch: Dispatch,
    provider: IdentityProvider,
    accountName: string,
    identityName: string,
    walletId: number,
    iframeRef: RefObject<HTMLIFrameElement>,
    onError: (message: string) => void
) {
    let identityObjectLocation;
    let identityId;
    try {
        const IdentityProviderLocation = await performIdObjectRequest(
            provider.metadata.issuanceStart,
            redirectUri,
            idObjectRequest
        );
        setLocation(IdentityProviderLocation);
        identityObjectLocation = await handleIdentityProviderLocation(
            iframeRef
        );

        // TODO: Handle the case where the app closes before we are able to save pendingIdentity
        identityId = await addPendingIdentity(
            identityNumber,
            dispatch,
            identityName,
            identityObjectLocation,
            provider,
            randomness,
            walletId
        );
        await addPendingAccount(dispatch, accountName, identityId, true); // TODO: can we add the address already here?
    } catch (e) {
        onError(`Failed to create identity due to ${e}`);
        return;
    }
    confirmIdentityAndInitialAccount(
        dispatch,
        identityName,
        identityId,
        accountName,
        identityObjectLocation
    ).catch(() => onError(`Failed to confirm identity`));
}

export interface ExternalIssuanceLocationState extends SignedIdRequest {
    identityNumber: number;
    walletId: number;
}

interface Props {
    identityName: string;
    accountName: string;
    provider: IdentityProvider;
    onError(message: string): void;
}

export default function ExternalIssuance({
    identityName,
    accountName,
    provider,
    onError,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const { state } = useLocation<ExternalIssuanceLocationState>();

    const [location, setLocation] = useState<string>();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [warnWhenNavigate, setWarnWhenNavigate] = useState(true);

    useLayoutEffect(() => {
        if (!state) {
            return;
        }

        const { idObjectRequest, randomness, identityNumber, walletId } = state;

        generateIdentity(
            idObjectRequest,
            randomness,
            identityNumber,
            setLocation,
            dispatch,
            provider,
            accountName,
            identityName,
            walletId,
            iframeRef,
            onError
        )
            .then(() => {
                setWarnWhenNavigate(false);
                return dispatch(push(routes.IDENTITYISSUANCE_FINAL));
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!state) {
        return <Redirect to={routes.IDENTITIES} />;
    }

    const navigationWarning = (
        <Prompt
            when={warnWhenNavigate}
            message="You are about to abort creating an identity. Are you sure?"
        />
    );

    if (!location) {
        return (
            <>
                {navigationWarning}
                <Loading text="Generating your identity" />
            </>
        );
    }

    return (
        <>
            {navigationWarning}
            <h2 className={generalStyles.header}>Generating the Identity</h2>
            <webview
                ref={iframeRef}
                className={styles.fullscreen}
                src={location}
            />
        </>
    );
}
