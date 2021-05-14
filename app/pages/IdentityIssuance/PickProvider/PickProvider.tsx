import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import { Prompt } from 'react-router-dom';
import routes from '~/constants/routes.json';
import { getIdentityProviders } from '~/utils/httpRequests';
import { IdentityProvider } from '~/utils/types';
import Card from '~/cross-app-components/Card';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { globalSelector } from '~/features/GlobalSlice';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getNextIdentityNumber } from '~/database/IdentityDao';
import { createIdentityRequestObjectLedger } from '~/utils/rustInterface';
import errorMessages from '~/constants/errorMessages.json';

import styles from './PickProvider.module.scss';
import { ExternalIssuanceLocationState } from '../ExternalIssuance/ExternalIssuance';
import CardList from '~/cross-app-components/CardList';
import pairWallet from '~/utils/WalletPairing';

interface Props {
    setProvider(provider: IdentityProvider): void;
    onError(message: string): void;
    provider: IdentityProvider | undefined;
}

export default function IdentityIssuanceChooseProvider({
    setProvider,
    onError,
    provider,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [providers, setProviders] = useState<IdentityProvider[]>([]);
    const global = useSelector(globalSelector);
    const [warnWhenNavigate, setWarnWhenNavigate] = useState(true);

    useEffect(() => {
        getIdentityProviders()
            .then((loadedProviders) => setProviders(loadedProviders))
            .catch(() => onError('Unable to load identity providers'));
    }, [dispatch, onError]);

    function onClick(p: IdentityProvider) {
        setProvider(p);
    }

    async function withLedger(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!provider) {
            return;
        }

        if (!global) {
            onError(errorMessages.missingGlobal);
            return;
        }

        const walletId = await pairWallet(ledger, dispatch);
        const identityNumber = await getNextIdentityNumber(walletId);

        const idObj = await createIdentityRequestObjectLedger(
            identityNumber,
            provider.ipInfo,
            provider.arsInfos,
            global,
            setMessage,
            ledger
        );

        const nextLocationState: ExternalIssuanceLocationState = {
            ...idObj,
            identityNumber,
            walletId,
        };

        setWarnWhenNavigate(false);
        dispatch(
            push({
                pathname: routes.IDENTITYISSUANCE_EXTERNAL,
                state: nextLocationState,
            })
        );
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
            <Prompt
                when={warnWhenNavigate}
                message="You are about to abort creating an identity. Are you sure?"
            />
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
                <SimpleLedger ledgerCall={withLedger} disabled={!provider} />
            </div>
        </>
    );
}
