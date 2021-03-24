import { useState, useEffect, useCallback, useMemo } from 'react';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';

import { AppAndVersion } from '~/features/ledger/GetAppAndVersion';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import getErrorDescription from '~/features/ledger/ErrorCodes';

function isConcordiumApp({ name }: AppAndVersion) {
    return name === 'Concordium';
}

interface TransportStatusError {
    name: string;
    message: string;
    stack: string;
    statusCode: number;
    statusText: string;
}

function instanceOfTransportStatusError(
    object: Error
): object is TransportStatusError {
    return (
        'name' in object &&
        'message' in object &&
        'stack' in object &&
        'statusCode' in object &&
        'statusText' in object
    );
}

export type LedgerStatus =
    | 'LOADING'
    | 'ERROR'
    | 'CONNECTED'
    | 'OPEN_APP'
    | 'AWAITING_USER_INPUT';

export default function useLedger(): {
    client: ConcordiumLedgerClient | undefined;
    deviceName: string | undefined;
    status: LedgerStatus;
    submitHandler: (
        cb: (client: ConcordiumLedgerClient) => Promise<void>
    ) => Promise<void>;
} {
    const [client, setClient] = useState<ConcordiumLedgerClient | undefined>(
        undefined
    );
    const [status, setStatus] = useState<LedgerStatus>('LOADING');
    const [deviceName, setDeviceName] = useState<string | undefined>();

    const [ledgerSubscription, setLedgerSubscription] = useState<
        Subscription | undefined
    >(undefined);

    const ledgerObserver: Observer<DescriptorEvent<string>> = useMemo(() => {
        return {
            complete: () => {
                // This is expected to never trigger.
            },
            error: () => {
                setStatus('ERROR');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next: async (event: any) => {
                if (event.type === 'add') {
                    const transport = await TransportNodeHid.open(event.path);
                    const concordiumClient = new ConcordiumLedgerClient(
                        transport
                    );
                    const appAndVersion = await concordiumClient.getAppAndVersion();

                    if (isConcordiumApp(appAndVersion)) {
                        setDeviceName(event.deviceModel.productName);
                        setStatus('CONNECTED');
                        setClient(concordiumClient);
                    } else {
                        // The device has been connected, but the Concordium application has not
                        // been opened yet.
                        setStatus('OPEN_APP');
                    }
                } else {
                    setStatus('LOADING');
                    setClient(undefined);
                }
            },
        };
    }, []);

    const listenForLedger = useCallback(() => {
        if (!ledgerSubscription) {
            const subscription = TransportNodeHid.listen(ledgerObserver);
            setLedgerSubscription(subscription);
        }
    }, [ledgerSubscription, ledgerObserver]);

    const submitHandler = useCallback(
        async (cb: (client: ConcordiumLedgerClient) => Promise<void>) => {
            setStatus('AWAITING_USER_INPUT');
            try {
                if (client) {
                    await cb(client);
                }
            } catch (error) {
                let errorMessage;
                if (instanceOfTransportStatusError(error)) {
                    errorMessage = getErrorDescription(error.statusCode);
                } else {
                    errorMessage = `An error occurred: ${error}`;
                }
                errorMessage += ' Please try again.';
                console.error(errorMessage);
                setStatus('ERROR');
            }
        },
        [client]
    );

    useEffect(() => {
        listenForLedger();
        return function cleanup() {
            if (ledgerSubscription !== undefined) {
                ledgerSubscription.unsubscribe();
            }
            if (client) {
                client.closeTransport();
                setClient(undefined);
            }
        };
    }, [ledgerSubscription, listenForLedger, client]);

    return {
        client,
        deviceName,
        status,
        submitHandler,
    };
}
