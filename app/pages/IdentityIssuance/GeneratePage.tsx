import React, { useEffect, useState, useRef, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card } from 'semantic-ui-react';
import {
    addPendingIdentity,
    confirmIdentity,
    rejectIdentity,
} from '../../features/IdentitySlice';
import {
    addPendingAccount,
    confirmInitialAccount,
} from '../../features/AccountSlice';
import routes from '../../constants/routes.json';
import styles from './IdentityIssuance.module.scss';
import {
    getGlobal,
    performIdObjectRequest,
    getIdObject,
} from '../../utils/httpRequests';
import { createIdentityRequestObjectLedger } from '../../utils/rustInterface';
import { getNextId } from '../../database/IdentityDao';
import { IdentityProvider, Dispatch } from '../../utils/types';
import { addToAddressBook } from '../../features/AddressBookSlice';

const redirectUri = 'ConcordiumRedirectToken';

async function createIdentityObjectRequest(
    id: number,
    provider: IdentityProvider,
    setText: (text: string) => void
) {
    const global = await getGlobal();
    return createIdentityRequestObjectLedger(
        id,
        provider.ipInfo,
        provider.arsInfos,
        global,
        setText
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

/**
 * Listens until, the identityProvider confirms the identity/initial account and returns the identiyObject.
 * Then updates the identity/initial account in the database.
 * If not confirmed, the identity will be marked as rejected.
 */
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
        addToAddressBook(dispatch, {
            name: accountName,
            address: token.accountAddress,
            note: `Initial account of ${identityName}`,
            readOnly: true,
        });
    } catch (err) {
        if (!token) {
            await rejectIdentity(dispatch, identityName);
        } else {
            // eslint-disable-next-line no-console
            console.log(err);
            // eslint-disable-next-line no-console
            console.log(token); // TODO: Handle unable to save identity/account
        }
    }
}

async function generateIdentity(
    setLocation: (location: string) => void,
    setText: (text: string) => void,
    dispatch: Dispatch,
    provider: IdentityProvider,
    accountName: string,
    identityName: string,
    iframeRef: RefObject<HTMLIFrameElement>,
    onError: (message: string) => void
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
        onError(`Failed to  create identity due to ${e.stack}`);
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
    const [text, setText] = useState<string>();
    const [location, setLocation] = useState<string>();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        generateIdentity(
            setLocation,
            setText,
            dispatch,
            provider,
            accountName,
            identityName,
            iframeRef,
            onError
        );
    }, [
        provider,
        setLocation,
        setText,
        dispatch,
        accountName,
        identityName,
        iframeRef,
        onError,
    ]);

    if (!location) {
        return (
            <Card fluid centered>
                <Card.Content textAlign="center">
                    <Card.Header>Generating the Identity</Card.Header>
                    <Card.Description>{text}</Card.Description>
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
