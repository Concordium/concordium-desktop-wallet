import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import type { Rectangle } from 'electron';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Redirect, useLocation } from 'react-router';
import { loadIdentities } from '~/features/IdentitySlice';
import { loadAccounts } from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import {
    IdentityProvider,
    Dispatch,
    SignedIdRequest,
    IdObjectRequest,
    Versioned,
    IdentityStatus,
} from '~/utils/types';
import { confirmIdentityAndInitialAccount } from '~/utils/IdentityStatusPoller';
import { performIdObjectRequest } from '~/utils/httpRequests';

import generalStyles from '../IdentityIssuance.module.scss';
import styles from './ExternalIssuance.module.scss';
import { currentIdentityVersion } from '~/utils/identityHelpers';
import { insertPendingIdentity } from '~/database/IdentityDao';
import { getElementRectangle } from '~/utils/htmlHelpers';
import { ViewResponseStatus } from '~/preload/preloadTypes';

const redirectUri = 'ConcordiumRedirectToken';

enum IdentityRequestStatus {
    Success,
    Aborted,
    Failed,
}

interface IdentitySuccess {
    identityId: number;
    status: IdentityRequestStatus.Success;
}

interface IdentityAborted {
    status: IdentityRequestStatus.Aborted;
}

interface IdentityFailed {
    status: IdentityRequestStatus.Failed;
}

type IdentityGenerationResult =
    | IdentitySuccess
    | IdentityAborted
    | IdentityFailed;

/**
 * Performs the identity creation flow with an identity provider.
 * 1. Send the identity object request to the identity provider.
 * 1. Extract the Location from the HTTP 302 Found returned by the identity provider.
 * 1. Open browser view at the Location extracted.
 * 1. The user goes through the steps defined by the identity provider within the browser window.
 * Eventually the identity provider returns with an HTTP 302 Found with the location used to
 * poll for the identity.
 * 1. Update the local database with the identity and initial account.
 * 1. Start polling for the identity to resolve the status of the identity and the initial account.
 */
async function generateIdentity(
    idObjectRequest: Versioned<IdObjectRequest>,
    randomness: string,
    identityNumber: number,
    dispatch: Dispatch,
    provider: IdentityProvider,
    identityName: string,
    walletId: number,
    onError: (message: string) => void,
    rect: Rectangle
): Promise<IdentityGenerationResult> {
    let identityObjectLocation;
    let identityId;
    try {
        // Initiate the identity creation process by sending the identity object request
        // to the identity provider. The identity provider will return with an HTTP 302 Found
        // indicating where we should open the browser view to perform the identity creation
        // process.
        const identityProviderLocation = await performIdObjectRequest(
            provider.metadata.issuanceStart,
            redirectUri,
            idObjectRequest
        );

        window.log.info(`Identity Object Request successful.`);

        // Open a browser view at the received location. The user will be using the
        // browser view to perform the identity creation process at the identity provider.
        // The identity provider will, at the end of the process, return an HTTP 302 Found
        // that points to the location where the identity can be polled for.
        const providerResult = await window.view.createView(
            identityProviderLocation,
            rect
        );

        if (providerResult.status === ViewResponseStatus.Aborted) {
            return { status: IdentityRequestStatus.Aborted };
        }
        if (providerResult.status === ViewResponseStatus.Error) {
            throw new Error(providerResult.error);
        }

        identityObjectLocation = providerResult.result;

        window.log.info(`Identity Object Location determined.`);

        // TODO This code still has an issue if the application fails before
        // inserting the pending identity and account, as the identity might exist
        // at the identity provider at this point. This requires a change to the
        // identity providers, and cannot be fixed before that has been implemented.

        const identity = {
            identityNumber,
            name: identityName,
            status: IdentityStatus.Pending,
            codeUri: identityObjectLocation,
            identityProvider: JSON.stringify(provider),
            randomness,
            walletId,
            version: currentIdentityVersion,
        };

        identityId = await insertPendingIdentity(identity);

        window.log.info('Saved identity object.');

        loadIdentities(dispatch);
        loadAccounts(dispatch);
    } catch (e) {
        window.log.error(e, 'Failed to create identity');
        window.view.removeView();
        onError(`Failed to create identity due to ${e}`);
        return { status: IdentityRequestStatus.Failed };
    }
    confirmIdentityAndInitialAccount(
        dispatch,
        identityId,
        identityObjectLocation
    ).catch((e) => {
        window.log.error(e, 'Confirmation of Identity failed');
        onError(`Failed to confirm identity`);
    });
    return { identityId, status: IdentityRequestStatus.Success };
}

export interface ExternalIssuanceLocationState extends SignedIdRequest {
    identityNumber: number;
    walletId: number;
}

interface Props {
    identityName: string;
    provider: IdentityProvider;
    onError(message: string): void;
}

export default function ExternalIssuance({
    identityName,
    provider,
    onError,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const { state } = useLocation<ExternalIssuanceLocationState>();

    const [abortSignal] = useState(new AbortController());
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            // Remove BrowserView when leaving view;
            window.view.removeView();
            // Remove resize listener;
            abortSignal.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const resize = () => {
            const rect = getElementRectangle(divRef.current);
            if (rect) {
                window.view.resizeView(rect);
            }
        };
        window.addEventListener('resize', resize, {
            signal: abortSignal.signal,
        } as AddEventListenerOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {
        if (!state) {
            return;
        }
        const rect = getElementRectangle(divRef.current);
        if (!rect) {
            onError('Html Element not initialised');
            return;
        }

        const { idObjectRequest, randomness, identityNumber, walletId } = state;

        generateIdentity(
            idObjectRequest,
            randomness,
            identityNumber,
            dispatch,
            provider,
            identityName,
            walletId,
            onError,
            rect
        )
            .then((result: IdentityGenerationResult) => {
                if (
                    result.status === IdentityRequestStatus.Aborted ||
                    result.status === IdentityRequestStatus.Failed
                ) {
                    return false;
                }

                dispatch(
                    push({
                        pathname: routes.IDENTITYISSUANCE_FINAL,
                        state: result.identityId,
                    })
                );
                return true;
            })
            .catch(window.log.warn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!state) {
        return <Redirect to={routes.IDENTITIES} />;
    }

    return (
        <>
            <h2 className={generalStyles.header}>Generating the identity</h2>
            <div ref={divRef} className={styles.fullscreen} />
        </>
    );
}
