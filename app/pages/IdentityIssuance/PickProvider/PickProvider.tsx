import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import { getIdentityProviders } from '~/utils/httpRequests';
import {
    IdentityProvider,
    PublicInformationForIp,
    CreationKeys,
} from '~/utils/types';
import Card from '~/cross-app-components/Card';
import { globalSelector } from '~/features/GlobalSlice';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getNextIdentityNumber } from '~/database/IdentityDao';
import { createIdentityRequestObjectLedger } from '~/utils/rustInterface';
import errorMessages from '~/constants/errorMessages.json';
import SimpleLedgerWithCreationKeys from '~/components/ledger/SimpleLedgerWithCreationKeys';

import styles from './PickProvider.module.scss';
import { ExternalIssuanceLocationState } from '../ExternalIssuance/ExternalIssuance';
import CardList from '~/cross-app-components/CardList';
import pairWallet from '~/utils/WalletPairing';

const IPDetails = (info: PublicInformationForIp) => (
    <div className="textLeft">
        <p className="mT0">Please confirm details on ledger:</p>
        <p>
            <b>Identity Credentials Public (IdCredPub):</b> {info.idCredPub}
        </p>
        <p>
            <b>Registration ID (RegId):</b> {info.regId}
        </p>
        <p>
            <b>Public key:</b> {info.publicKeys.keys[0].verifyKey}
        </p>
        <p>
            <b>Threshold:</b> {info.publicKeys.threshold}
        </p>
    </div>
);

interface Props {
    setProvider(provider: IdentityProvider): void;
    onError(message: string): void;
    provider: IdentityProvider | undefined;
    setIsSigning(isSigning: boolean): void;
}

export default function IdentityIssuanceChooseProvider({
    setProvider,
    onError,
    provider,
    setIsSigning,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [providers, setProviders] = useState<IdentityProvider[]>([]);
    const [
        nextLocationState,
        setNextLocationState,
    ] = useState<ExternalIssuanceLocationState>();
    const global = useSelector(globalSelector);

    useEffect(() => {
        getIdentityProviders()
            .then((loadedProviders) => setProviders(loadedProviders))
            .catch((e) => {
                window.log.warn(
                    `Unable to load identity providers due to ${e.message}`
                );
                onError('Unable to load identity providers');
            });
    }, [dispatch, onError]);

    // This is run in an effect, to prevent navigation if the component is unmounted
    useEffect(() => {
        if (nextLocationState !== undefined) {
            dispatch(
                push({
                    pathname: routes.IDENTITYISSUANCE_EXTERNAL,
                    state: nextLocationState,
                })
            );
        }
    }, [dispatch, nextLocationState]);

    function onClick(p: IdentityProvider) {
        setProvider(p);
    }

    const withLedger = useCallback(
        (keys: CreationKeys) => {
            return async (
                ledger: ConcordiumLedgerClient,
                setMessage: (message: string | JSX.Element) => void
            ) => {
                setIsSigning(true);
                setMessage('Please wait');

                try {
                    if (!provider) {
                        return;
                    }

                    if (!global) {
                        onError(errorMessages.missingGlobal);
                        return;
                    }

                    const walletId = await pairWallet(ledger, dispatch);
                    const identityNumber = await getNextIdentityNumber(
                        walletId
                    );

                    const idObj = await createIdentityRequestObjectLedger(
                        identityNumber,
                        keys,
                        provider.ipInfo,
                        provider.arsInfos,
                        global,
                        setMessage,
                        ledger,
                        IPDetails
                    );
                    window.log.info('Created Identity Object Request.');

                    setNextLocationState({
                        ...idObj,
                        walletId,
                        identityNumber,
                    });
                } finally {
                    setIsSigning(false);
                }
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [global, provider, IPDetails]
    );

    async function getIdentityNumber(ledger: ConcordiumLedgerClient) {
        const walletId = await pairWallet(ledger, dispatch);
        const identityNumber = await getNextIdentityNumber(walletId);
        return { identityNumber };
    }

    return (
        <>
            <h2 className={styles.header}>The identity provider</h2>
            <p className={styles.text}>
                The next step of creating a new identity is to choose an
                identity provider. The list of providers will be expanding over
                time, but the current providers can be seen below. You can check
                out their privacy policies before selecting a provider.
            </p>
            <p className={styles.text}>
                When you have selected an identity provider on the left, you
                must sign your submission with your hardware wallet, before you
                can continue.
            </p>
            <CardList className={styles.container}>
                {providers.map((p) => (
                    <Card
                        key={p.ipInfo.ipIdentity}
                        role="button"
                        onClick={() => onClick(p)}
                        className={clsx(
                            styles.item,
                            p.ipInfo.ipDescription.name ===
                                provider?.ipInfo.ipDescription.name &&
                                styles.active
                        )}
                    >
                        <img
                            alt={p.ipInfo.ipDescription.name}
                            src={`data:image/png;base64, ${p.metadata.icon}`}
                        />
                        <span className="body1 mL20">
                            {p.ipInfo.ipDescription.name}
                        </span>
                    </Card>
                ))}
            </CardList>
            <div className={styles.container}>
                <SimpleLedgerWithCreationKeys
                    credentialNumber={0}
                    ledgerCallback={withLedger}
                    preCallback={getIdentityNumber}
                    disabled={!provider}
                />
            </div>
        </>
    );
}
