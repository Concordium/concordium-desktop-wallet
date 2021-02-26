import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';
import { Button, Card, Divider, Loader, Segment } from 'semantic-ui-react';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { AppAndVersion } from '../../features/ledger/GetAppAndVersion';

interface Props {
    ledgerCall: (
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) => Promise<void>;
}

function isConcordiumApp({ name }: AppAndVersion) {
    return name === 'Concordium';
}

export default function LedgerComponent({ ledgerCall }: Props): JSX.Element {
    const [ledger, setLedger] = useState<ConcordiumLedgerClient | undefined>(
        undefined
    );
    const [statusMessage, setStatusMessage] = useState('Waiting for device');
    const [ready, setReady] = useState(false);
    const [ledgerSubscription, setLedgerSubscription] = useState<
        Subscription | undefined
    >(undefined);
    const [waitingForDevice, setWaitingForDevice] = useState<boolean>(true);

    const ledgerObserver: Observer<DescriptorEvent<string>> = useMemo(() => {
        return {
            complete: () => {
                // This is expected to never trigger.
            },
            error: () => {
                setStatusMessage('Unable to connect to device');
                setReady(false);
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
                        setStatusMessage(
                            `${event.deviceModel.productName} is ready!`
                        );
                        setLedger(concordiumClient);
                        setReady(true);
                        setWaitingForDevice(false);
                    } else {
                        // The device has been connected, but the Concordium application has not
                        // been opened yet.
                        setStatusMessage(
                            `Please open the Concordium application on your ${event.deviceModel.productName}`
                        );
                    }
                } else {
                    setStatusMessage('Waiting for device');
                    setWaitingForDevice(true);
                    setLedger(undefined);
                    setReady(false);
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

    async function submit() {
        setReady(false);
        try {
            if (ledger) {
                await ledgerCall(ledger, setStatusMessage);
            }
        } catch (e) {
            console.log(e);
            setStatusMessage(
                'An error occurred while communcating with your device'
            );
            setReady(true);
        }
    }

    useEffect(() => {
        listenForLedger();
        return function cleanup() {
            if (ledgerSubscription !== undefined) {
                ledgerSubscription.unsubscribe();
            }
            setLedger(undefined);
        };
    }, [ledgerSubscription, listenForLedger]);

    return (
        <Card fluid>
            <Card.Content textAlign="center">
                <Card.Header>Device connection</Card.Header>
                <Divider />
                <Card.Description>{statusMessage}</Card.Description>
                <Card.Description>
                    <Segment basic>
                        <Loader
                            active={waitingForDevice}
                            inline
                            indeterminate
                            size="large"
                        />
                    </Segment>
                </Card.Description>
            </Card.Content>
            <Card.Content extra textAlign="center">
                <Button primary onClick={submit} disabled={!ready}>
                    Submit
                </Button>
            </Card.Content>
        </Card>
    );
}
