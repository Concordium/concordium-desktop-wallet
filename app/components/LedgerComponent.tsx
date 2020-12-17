import React, { useState, useEffect } from 'react';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import styles from './Styling.css';

export default function LedgerComponent({ ledgerCall }): JSX.Element {
    const [ledger, setLedger] = useState(undefined);
    const [statusMessage, setStatusMessage] = useState('Waiting for device');
    const [ready, setReady] = useState(false);

    async function getLedger() {
        try {
            const transport = await TransportNodeHid.open('');
            setLedger(new ConcordiumLedgerClient(transport));
            setReady(true);
            setStatusMessage(`${transport.deviceModel.productName} connected`);
        } catch (e) {
            setStatusMessage(`Unable to connect:  ${e}`);
            setReady(false);
        }
    }

    useEffect(() => {
        getLedger();
    }, []);

    async function onSubmit() {
        setReady(false);
        try {
            if (ready) {
                await ledgerCall(ledger);
            } else {
                await getLedger();
            }
        } catch (e) {
            setStatusMessage(`Something went wrong:  ${e}`);
            setReady(true);
        }
    }

    return (
        <div className={styles.ledgerComponent}>
            <h2>Device Connection</h2>

            <pre>{statusMessage}</pre>

            <button type="submit" onClick={() => onSubmit()} disabled={!ready}>
                Submit
            </button>
        </div>
    );
}
