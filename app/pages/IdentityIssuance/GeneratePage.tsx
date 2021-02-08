import React, { useState, useRef, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card } from 'semantic-ui-react';
import { addPendingIdentity } from '../../features/IdentitySlice';
import { addPendingAccount } from '../../features/AccountSlice';
import routes from '../../constants/routes.json';
import styles from './IdentityIssuance.module.scss';
import { getGlobal, performIdObjectRequest } from '../../utils/httpRequests';
import { createIdentityRequestObjectLedger } from '../../utils/rustInterface';
import { getNextId } from '../../database/IdentityDao';
import { IdentityProvider, Dispatch } from '../../utils/types';
import { confirmIdentityAndInitialAccount } from '../../utils/IdentityStatusPoller';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';

const redirectUri = 'ConcordiumRedirectToken';

async function createIdentityObjectRequest(
    id: number,
    provider: IdentityProvider,
    setMessage: (text: string) => void,
    ledger: ConcordiumLedgerClient
) {
    const global = await getGlobal();
    return createIdentityRequestObjectLedger(
        id,
        provider.ipInfo,
        provider.arsInfos,
        global,
        setMessage,
        ledger
    );
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            iframeRef.current.addEventListener('did-navigate', (e: any) => {
                const loc = e.url;
                if (loc.includes(redirectUri)) {
                    resolve(loc.substring(loc.indexOf('=') + 1));
                }
            });
        }
    });
}

async function generateIdentity(
    idObjectRequest: string,
    randomness: string,
    identityId: number,
    setLocation: (location: string) => void,
    dispatch: Dispatch,
    provider: IdentityProvider,
    accountName: string,
    identityName: string,
    iframeRef: RefObject<HTMLIFrameElement>,
    onError: (message: string) => void
) {
    let identityObjectLocation;
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
        await addPendingIdentity(
            dispatch,
            identityName,
            identityObjectLocation,
            provider,
            randomness
        );
        await addPendingAccount(dispatch, accountName, identityId, 0); // TODO: can we add the address already here?
    } catch (e) {
        onError(`Failed to create identity due to ${e.stack}`);
        return;
    }
    try {
        confirmIdentityAndInitialAccount(
            dispatch,
            identityName,
            accountName,
            identityObjectLocation
        );
        dispatch(push(routes.IDENTITYISSUANCE_FINAL));
    } catch (e) {
        onError(`Failed to confirm identity`);
    }
}

interface Props {
    identityName: string;
    accountName: string;
    provider: IdentityProvider;
    onError(message: string): void;
}

export default function IdentityIssuanceGenerate({
    identityName,
    accountName,
    provider,
    onError,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [location, setLocation] = useState<string>();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    async function withLedger(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        const identityId = await getNextId();
        const {
            idObjectRequest,
            randomness,
        } = await createIdentityObjectRequest(
            identityId,
            provider,
            setMessage,
            ledger
        );
        generateIdentity(
            idObjectRequest,
            randomness,
            identityId,
            setLocation,
            dispatch,
            provider,
            accountName,
            identityName,
            iframeRef,
            onError
        );
    }

    if (!location) {
        return (
            <Card fluid centered>
                <Card.Content textAlign="center">
                    <Card.Header>Generating the Identity</Card.Header>
                    <LedgerComponent ledgerCall={withLedger} />
                </Card.Content>
            </Card>
        );
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Generating the Identity</Card.Header>
                <webview
                    ref={iframeRef}
                    className={styles.webview}
                    src={location}
                />
            </Card.Content>
        </Card>
    );
}
