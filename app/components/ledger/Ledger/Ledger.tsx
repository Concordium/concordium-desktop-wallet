import React from 'react';
import useLedger from '../useLedger';
import LedgerView, { LedgerViewProps } from './LedgerView';

type LedgerProps = Pick<LedgerViewProps, 'children' | 'className'>;

export default function Ledger({ ...props }: LedgerProps): JSX.Element {
    const { status, submitHandler, statusText } = useLedger();

    return (
        <LedgerView
            {...props}
            status={status}
            statusText={statusText}
            submitHandler={submitHandler}
        />
    );
}
