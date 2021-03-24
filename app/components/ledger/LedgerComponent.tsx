import React, { useState, useEffect } from 'react';
import { Button, Card, Divider, Loader, Segment } from 'semantic-ui-react';

import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import useLedger, { LedgerStatus } from './useLedger';

interface Props {
    ledgerCall: (
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) => Promise<void>;
}

function getStatusMessage(
    status: LedgerStatus,
    deviceName: string | undefined
): string {
    switch (status) {
        case 'LOADING':
            return 'Waiting for device';
        case 'ERROR':
            return 'Unable to connect to device';
        case 'CONNECTED':
            return `${deviceName} is ready!`;
        case 'OPEN_APP':
            return `Please open the Concordium application on your ${deviceName}`;
        default:
            throw new Error('Unsupported status');
    }
}

export default function LedgerComponent({ ledgerCall }: Props): JSX.Element {
    const { deviceName, status, submitHandler } = useLedger();
    const [statusMessage, setStatusMessage] = useState(
        getStatusMessage(status, deviceName)
    );

    useEffect(() => {
        setStatusMessage(getStatusMessage(status, deviceName));
    }, [status, deviceName]);

    async function submit() {
        submitHandler((client) => ledgerCall(client, setStatusMessage));
    }

    return (
        <Card fluid>
            <Card.Content textAlign="center">
                <Card.Header>Device connection</Card.Header>
                <Divider />
                <Card.Description>{statusMessage}</Card.Description>
                <Card.Description>
                    <Segment basic>
                        <Loader
                            active={status === 'LOADING'}
                            inline
                            indeterminate
                            size="large"
                        />
                    </Segment>
                </Card.Description>
            </Card.Content>
            <Card.Content extra textAlign="center">
                <Button
                    primary
                    onClick={submit}
                    disabled={status !== 'CONNECTED'}
                >
                    Submit
                </Button>
            </Card.Content>
        </Card>
    );
}
