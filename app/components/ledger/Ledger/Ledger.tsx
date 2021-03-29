import React from 'react';
import useLedger from '../useLedger';
import { LedgerCallback } from '../util';
import LedgerView, { LedgerViewProps } from './LedgerView';

interface LedgerProps extends Pick<LedgerViewProps, 'children'> {
    /**
     * Callback for interacting with the ledger concordium app client. This is called when the submithandler is invoked.
     */
    ledgerCallback: LedgerCallback;
}

/**
 * @description
 * Component for interacting with the Concordium app on ledger devices.
 *
 * @example
 * <Ledger ledgerCallback={(client, setStatusText) => ...}>
 *   {(status, statusView, submit) => (
 *     <div>
 *       {statusView}
 *       <Button onClick={submit} disabled={status !== LedgerStatusType.CONNECTED}>Submit</Button>
 *     </div>
 *   )}
 * </Ledger>
 */
export default function Ledger({
    ledgerCallback,
    ...props
}: LedgerProps): JSX.Element {
    const { status, submitHandler, statusText } = useLedger(ledgerCallback);

    return (
        <LedgerView
            {...props}
            status={status}
            statusText={statusText}
            submitHandler={submitHandler}
        />
    );
}
