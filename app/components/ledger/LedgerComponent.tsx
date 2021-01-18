import React, { useState, useEffect } from 'react';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import styles from '../multisig/Multisignature.css';

import type {
    Observer,
    DescriptorEvent,
    Subscription
} from "@ledgerhq/hw-transport";
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';

interface Props {
    ledgerCall: (
        ledger: ConcordiumLedgerClient,
        setMessage: (string) => void
    ) => Promise<void>;
}

export default function LedgerComponent({ ledgerCall }: Props): JSX.Element {
    const [ledger, setLedger] = useState<ConcordiumLedgerClient | undefined>(undefined);
    const [statusMessage, setStatusMessage] = useState('Waiting for device');
    const [ready, setReady] = useState(false);
    const [ledgerSubscription, setLedgerSubscription] = useState<Subscription | undefined>(undefined);

    const ledgerObserver: Observer<DescriptorEvent<string>> = {
        complete: () => {
            // TODO When is this event triggered, if at all?
        },
        error: (event) => { 
            setStatusMessage('Unable to connect to device')
            setReady(false);
        },
        next: async (event) => { 
            if (event.type === 'add') {
                setStatusMessage(event.deviceModel.productName + ' is connected!');
                // TODO Can be improved by also checking if the Concordium application is open,
                // i.e. by calling the get public-key method and verify it went okay. I do not
                // believe there currently is a better way to check for a specific application.
                const transport = await TransportNodeHid.open(event.path);
                setLedger(new ConcordiumLedgerClient(transport));
                setReady(true);
            } else {
                setStatusMessage('Waiting for device')
                setLedger(undefined);
                setReady(false);
            }
        }
    }

    function listenForLedger() {
        const subscription = TransportNodeHid.listen(ledgerObserver);
        setLedgerSubscription(subscription);
    }

    async function submit() {
        setReady(false);
        try {
            if (ledger) {
                await ledgerCall(ledger, setStatusMessage);
            }
        } catch (e) {
            // TODO Log or output error.
            setStatusMessage('An error occurred while communcating with your device');
            setReady(true);
        }
    }

    useEffect(() => {
        listenForLedger();
        return function cleanup() {
            setLedger(undefined);
            if (ledgerSubscription !== undefined) {
                ledgerSubscription.unsubscribe();
            }
        }
    }, []);

    return (
        <div className={styles.subbox}>
            <h1>Device Connection</h1>
            <hr></hr>
            <p>{statusMessage}</p>
            <button type="button" onClick={() => submit()} disabled={!ready}>
                Submit
            </button>
        </div>
    );
}
