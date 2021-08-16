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
    Identity,
    IdentityStatus,
    AccountStatus,
    Account,
} from '~/utils/types';
import { confirmIdentityAndInitialAccount } from '~/utils/IdentityStatusPoller';
import { performIdObjectRequest } from '~/utils/httpRequests';

import { getAddressFromCredentialId } from '~/utils/rustInterface';
import generalStyles from '../IdentityIssuance.module.scss';
import styles from './ExternalIssuance.module.scss';
import { getInitialEncryptedAmount } from '~/utils/accountHelpers';
import { insertPendingIdentityAndInitialAccount } from '~/database/IdentityDao';
import { getElementRectangle } from '~/utils/htmlHelpers';

const redirectUri = 'ConcordiumRedirectToken';

async function generateIdentity(
    idObjectRequest: Versioned<IdObjectRequest>,
    randomness: string,
    identityNumber: number,
    dispatch: Dispatch,
    provider: IdentityProvider,
    accountName: string,
    identityName: string,
    walletId: number,
    onError: (message: string) => void,
    rect: Rectangle
): Promise<number> {
    let identityObjectLocation;
    let identityId;
    try {
        const identityProviderLocation = await performIdObjectRequest(
            provider.metadata.issuanceStart,
            redirectUri,
            idObjectRequest
        );
        const providerResult = await window.view.createView(
            identityProviderLocation,
            rect
        );

        if (providerResult.error) {
            throw new Error(providerResult.error);
        }
        identityObjectLocation = providerResult.result;

        // TODO This code still has an issue if the application fails before
        // inserting the pending identity and account, as the identity might exist
        // at the identity provider at this point. This requires a change to the
        // identity providers, and cannot be fixed before that has been implemented.

        const identity: Partial<Identity> = {
            identityNumber,
            name: identityName,
            status: IdentityStatus.Pending,
            codeUri: identityObjectLocation,
            identityProvider: JSON.stringify(provider),
            randomness,
            walletId,
        };

        const accountAddress = await getAddressFromCredentialId(
            idObjectRequest.value.pubInfoForIp.regId
        );

        const initialAccount: Omit<Account, 'identityId'> = {
            name: accountName,
            status: AccountStatus.Pending,
            address: accountAddress,
            signatureThreshold: 1,
            maxTransactionId: '0',
            isInitial: true,
            rewardFilter: '[]',
            selfAmounts: getInitialEncryptedAmount(),
            incomingAmounts: '[]',
            totalDecrypted: '0',
            deploymentTransactionId: undefined,
        };

        identityId = await insertPendingIdentityAndInitialAccount(
            identity,
            initialAccount
        );
        loadIdentities(dispatch);
        loadAccounts(dispatch);
    } catch (e) {
        window.view.removeView();
        onError(`Failed to create identity due to ${e}`);
        // Rethrow this to avoid redirection;
        throw e;
    }
    confirmIdentityAndInitialAccount(
        dispatch,
        identityName,
        identityId,
        accountName,
        identityObjectLocation
    ).catch(() => onError(`Failed to confirm identity`));
    return identityId;
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
            accountName,
            identityName,
            walletId,
            onError,
            rect
        )
            .then((identityId) => {
                return dispatch(
                    push({
                        pathname: routes.IDENTITYISSUANCE_FINAL,
                        state: identityId,
                    })
                );
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!state) {
        return <Redirect to={routes.IDENTITIES} />;
    }

    return (
        <>
            <h2 className={generalStyles.header}>Generating the Identity</h2>
            <div ref={divRef} className={styles.fullscreen} />
        </>
    );
}
