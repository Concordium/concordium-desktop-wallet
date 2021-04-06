import React from 'react';
import { Card, Divider } from 'semantic-ui-react';
import Button from '~/cross-app-components/Button';

import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { asyncNoOp } from '~/utils/basicHelpers';
import Ledger from '../Ledger';
import { LedgerStatusType } from '../util';

import styles from './SimpleLedger.module.scss';

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
                <Ledger ledgerCallback={ledgerCall}>
                    {(status, statusView, submit = asyncNoOp) => (
                        <div className={styles.content}>
                            {statusView}
                            <Button
                                className={styles.submit}
                                onClick={submit}
                                disabled={status !== LedgerStatusType.CONNECTED}
                            >
                                Submit
                            </Button>
                        </div>
                    )}
                </Ledger>
            </Card.Content>
        </Card>
    );
}
