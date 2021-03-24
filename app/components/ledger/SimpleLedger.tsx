import React from 'react';
import { Card, Divider } from 'semantic-ui-react';
import Button from '~/cross-app-components/Button';

import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { asyncNoOp } from '~/utils/basicHelpers';
import Ledger from './Ledger';

interface Props {
    ledgerCall: (
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) => Promise<void>;
}

export default function SimpleLedger({ ledgerCall }: Props): JSX.Element {
    return (
        <Card fluid>
            <Card.Content textAlign="center">
                <Card.Header>Device connection</Card.Header>
                <Divider />
                <Ledger>
                    {(_, submit = asyncNoOp) => (
                        <Button
                            onClick={() => submit(ledgerCall)}
                            disabled={submit === asyncNoOp}
                        >
                            Submit
                        </Button>
                    )}
                </Ledger>
            </Card.Content>
        </Card>
    );
}
