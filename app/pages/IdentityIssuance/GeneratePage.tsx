import React, { useState, useRef, RefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { Card } from 'semantic-ui-react';
import { globalSelector } from '../../features/GlobalSlice';
import { addPendingIdentity } from '../../features/IdentitySlice';
import { addPendingAccount } from '../../features/AccountSlice';
import routes from '../../constants/routes.json';
import styles from './IdentityIssuance.module.scss';
import {
    getPromise,
    getResponseBody,
    performIdObjectRequest,
} from '../../utils/httpRequests';
import { createIdentityRequestObjectLedger } from '../../utils/rustInterface';
import { getNextId } from '../../database/IdentityDao';
import { IdentityProvider, Dispatch, Global, Hex } from '../../utils/types';
import { confirmIdentityAndInitialAccount } from '../../utils/IdentityStatusPoller';
import SimpleLedger from '../../components/ledger/SimpleLedger';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getPairingPath } from '~/features/ledger/Path';
import { hardwareWalletExists, insertHwWallet } from '~/database/HwWalletDao';

const redirectUri = 'ConcordiumRedirectToken';

async function getBody(url: string) {
    const response = await getPromise(url);
    return getResponseBody(response);
}

async function createIdentityObjectRequest(
    id: number,
    provider: IdentityProvider,
    setMessage: (text: string) => void,
    ledger: ConcordiumLedgerClient,
    global: Global
) {
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
    identityId: number,
    setLocation: (location: string) => void,
    dispatch: Dispatch,
    provider: IdentityProvider,
    accountName: string,
    identityName: string,
    pairingKey: Hex,
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

        // Pair the hardware wallet with the desktop wallet, if it has not
        // already been paired.
        if (!(await hardwareWalletExists(pairingKey))) {
            await insertHwWallet(pairingKey);
        }

        // TODO: Handle the case where the app closes before we are able to save pendingIdentity
        await addPendingIdentity(
            dispatch,
            identityName,
            identityObjectLocation,
            provider,
            randomness,
            pairingKey
        );
        await addPendingAccount(dispatch, accountName, identityId, true); // TODO: can we add the address already here?
    } catch (e) {
        onError(`Failed to create identity due to ${e}`);
        return;
    }
    try {
        confirmIdentityAndInitialAccount(
            dispatch,
            identityName,
            identityId,
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
    const global = useSelector(globalSelector);

    async function withLedger(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!global) {
            onError(`Unexpected missing global object`);
            return;
        }

        const identityId = await getNextId();
        const {
            idObjectRequest,
            randomness,
        } = await createIdentityObjectRequest(
            identityId,
            provider,
            setMessage,
            ledger,
            global
        );

        // Extract the pairing public-key
        const pairingKey = (
            await ledger.getPublicKeySilent(getPairingPath())
        ).toString('hex');
        generateIdentity(
            idObjectRequest,
            randomness,
            identityId,
            setLocation,
            dispatch,
            provider,
            accountName,
            identityName,
            pairingKey,
            iframeRef,
            onError
        );
    }

    if (!location) {
        return (
            <Card fluid centered>
                <Card.Content textAlign="center">
                    <Card.Header>Generating the Identity</Card.Header>
                    <SimpleLedger ledgerCall={withLedger} />
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
