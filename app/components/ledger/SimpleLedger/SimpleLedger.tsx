import clsx from 'clsx';
import React from 'react';

import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { asyncNoOp } from '~/utils/basicHelpers';
import { ClassName } from '~/utils/types';
import Ledger from '../Ledger';

import styles from './SimpleLedger.module.scss';

interface Props extends ClassName {
    ledgerCall: (
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string | JSX.Element) => void
    ) => Promise<void>;
    disabled?: boolean;
}

export default function SimpleLedger({
    ledgerCall,
    disabled = false,
    className,
}: Props): JSX.Element {
    return (
        <Card
            header="Device connection"
            className={clsx(styles.root, className)}
        >
            <Ledger ledgerCallback={ledgerCall}>
                {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                    <>
                        <div className={styles.status}>{statusView}</div>
                        <Button
                            className={styles.submit}
                            onClick={submitHandler}
                            disabled={!isReady || disabled}
                        >
                            Submit
                        </Button>
                    </>
                )}
            </Ledger>
        </Card>
    );
}
