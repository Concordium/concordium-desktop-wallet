import React from 'react';
import LedgerStatus, { LedgerStatusProps } from '../LedgerStatus';
import { LedgerStatusType, LedgerSubmitHandler } from '../util';

export interface LedgerViewProps extends LedgerStatusProps {
    /**
     * Invokes the passed callback function with the ledger app client and a function for setting status messages custom to the individual flow.
     */
    submitHandler: LedgerSubmitHandler;
    /**
     * Child as function pattern, exposing necessary properties for composing a view.
     *
     * @param status Current status of the ledger connection.
     * @param statusView View containing the status icon and status text.
     * @param submitHandler Function for starting the ledger signing flow. Available when this is LedgerStatusType.CONNECTED.
     */
    children(
        status: LedgerStatusType,
        statusView: JSX.Element,
        submitHandler?: LedgerSubmitHandler
    ): JSX.Element;
}

/**
 * @description
 * Is for storybook. DO NOT USE!
 * Use \<Ledger /\> instead.
 */
export default function LedgerView({
    submitHandler,
    children,
    ...statusProps
}: LedgerViewProps): JSX.Element {
    return children(
        statusProps.status,
        <LedgerStatus {...statusProps} />,
        submitHandler
    );
}
