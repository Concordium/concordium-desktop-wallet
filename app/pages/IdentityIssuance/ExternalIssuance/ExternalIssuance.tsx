import React, { useState, useRef, RefObject, useLayoutEffect } from 'react';
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
import Loading from '~/cross-app-components/Loading';
import ipcCommands from '../../../constants/ipcCommands.json';
import { performIdObjectRequest } from '~/utils/httpRequests';

import { getAddressFromCredentialId } from '~/utils/rustInterface';
import generalStyles from '../IdentityIssuance.module.scss';
import styles from './ExternalIssuance.module.scss';
import { getInitialEncryptedAmount } from '~/utils/accountHelpers';

const redirectUri = 'ConcordiumRedirectToken';

async function getBody(url: string): Promise<string> {
    return window.ipcRenderer.invoke(ipcCommands.httpGet, url);
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
    idObjectRequest: Versioned<IdObjectRequest>,
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
): Promise<number> {
    let identityObjectLocation;
    let identityId;
    try {
        const identityProviderLocation = await performIdObjectRequest(
            provider.metadata.issuanceStart,
            redirectUri,
            idObjectRequest
        );
        setLocation(identityProviderLocation);
        identityObjectLocation = await handleIdentityProviderLocation(
            iframeRef
        );

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
            maxTransactionId: 0,
            isInitial: true,
            rewardFilter: '[]',
            selfAmounts: getInitialEncryptedAmount(),
            incomingAmounts: '[]',
            totalDecrypted: '0',
            deploymentTransactionId: undefined,
        };

        // Insert the pending identity and account transactionally.
        identityId = await window.ipcRenderer.invoke(
            ipcCommands.database.identity
                .insertPendingIdentityAndInitialAccount,
            identity,
            initialAccount
        );

        loadIdentities(dispatch);
        loadAccounts(dispatch);
    } catch (e) {
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

    const [location, setLocation] = useState<string>();
    const iframeRef = useRef<HTMLIFrameElement>(null);

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

    if (!location) {
        return (
            <>
                <Loading text="Generating your identity" />
            </>
        );
    }

    return (
        <>
            <h2 className={generalStyles.header}>Generating the Identity</h2>
            <webview
                ref={iframeRef}
                className={styles.fullscreen}
                src={location}
            />
        </>
    );
}
