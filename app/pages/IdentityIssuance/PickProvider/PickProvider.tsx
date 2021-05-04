import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import { getIdentityProviders } from '~/utils/httpRequests';
import { IdentityProvider } from '~/utils/types';
import Card from '~/cross-app-components/Card';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { globalSelector } from '~/features/GlobalSlice';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getNextId } from '~/database/IdentityDao';
import { createIdentityRequestObjectLedger } from '~/utils/rustInterface';

import styles from './PickProvider.module.scss';
import { stringify } from '~/utils/JSONHelper';

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
            onError(`Unexpected missing global object`);
            return;
        }

        const identityId = await getNextId();

        const idObj = await createIdentityRequestObjectLedger(
            identityId,
            provider.ipInfo,
            provider.arsInfos,
            global,
            setMessage,
            ledger
        );

        console.log(idObj);

        dispatch(
            push({
                pathname: routes.IDENTITYISSUANCE_EXTERNAL,
                state: JSON.stringify(idObj),
            })
        );
    }

    return (
        <>
            <h2 className={styles.header}>The identity provider</h2>
            <p>
                The next step of creating a new identity is to choose an
                identity provider. The list of providers will be expanding over
                time, but the current providers can be seen below. You can check
                out their privacy policies before selecting a provider.
            </p>
            <p>
                When you have entered your names on the left, you must sign your
                submission with your hardware wallet, before you can continue.
            </p>
            <div>
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
                    </Card>
                ))}
            </div>
            <div>
                <SimpleLedger ledgerCall={withLedger} disabled={!provider} />
            </div>
        </>
    );

    // return (
    //     <Card fluid centered>
    //         <Card.Content textAlign="center">
    //             <Card.Header>The identity provider</Card.Header>
    //             <Card.Description>
    //                 The next step of creating a new identity is to choose an
    //                 identity provider. The list of providers will be expanding
    //                 over time, but the current providers can be seen below. You
    //                 can check out their privacy policies before selecting a
    //                 provider.
    //             </Card.Description>
    //             <List>
    //                 <Divider />
    //                 {providers.map((provider) => (
    //                     <>
    //                         <List.Item
    //                             key={provider.ipInfo.ipIdentity}
    //                             onClick={() => onClick(provider)}
    //                         >
    //                             <Image
    //                                 spaced="right"
    //                                 size="small"
    //                                 src={`data:image/png;base64, ${provider.metadata.icon}`}
    //                             />
    //                             <List.Content verticalAlign="middle">
    //                                 <List.Header>
    //                                     {provider.ipInfo.ipDescription.name}
    //                                 </List.Header>
    //                             </List.Content>
    //                             <Button>Privacy Policy</Button>
    //                         </List.Item>
    //                         <Divider />
    //                     </>
    //                 ))}
    //             </List>
    //         </Card.Content>
    //     </Card>
    // );
}
