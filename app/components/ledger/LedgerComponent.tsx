import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';
import { Button, Card, Divider, Loader, Segment } from 'semantic-ui-react';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';

interface Props {
    ledgerCall: (
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) => Promise<void>;
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
                // TODO When is this event triggered, if at all?
            },
            error: () => {
                setStatusMessage('Unable to connect to device');
                setReady(false);
            },
            next: async (event) => {
                if (event.type === 'add') {
                    setStatusMessage(
                        `${event.deviceModel.productName} is connected!`
                    );
                    // TODO Can be improved by also checking if the Concordium application is open,
                    // i.e. by calling the get public-key method and verify it went okay. I do not
                    // believe there currently is a better way to check for a specific application.
                    const transport = await TransportNodeHid.open(event.path);
                    setLedger(new ConcordiumLedgerClient(transport));
                    setReady(true);
                    setWaitingForDevice(false);
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
            // TODO Log or output error.
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
