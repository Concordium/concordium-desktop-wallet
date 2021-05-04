import React from 'react';

import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { asyncNoOp } from '~/utils/basicHelpers';
import Ledger from '../Ledger';

import styles from './SimpleLedger.module.scss';

interface Props {
    ledgerCall: (
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) => Promise<void>;
}

export default function SimpleLedger({ ledgerCall }: Props): JSX.Element {
    return (
        <Card header="Device connection">
            <Ledger ledgerCallback={ledgerCall}>
                {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                    <div className={styles.content}>
                        {statusView}
                        <Button
                            className={styles.submit}
                            onClick={submitHandler}
                            disabled={!isReady}
                        >
                            Submit
                        </Button>
                    </div>
                )}
            </Ledger>
        </Card>
    );
}
