import React from 'react';
import LedgerStatus from '../LedgerStatus';
import { LedgerStatusType, LedgerSubmitHandler } from '../util';

// import styles from './Ledger.module.scss';

export interface LedgerViewProps {
    status: LedgerStatusType;
    statusText: string;
    submitHandler: LedgerSubmitHandler;
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
    status,
    statusText,
    submitHandler,
    children,
}: LedgerViewProps): JSX.Element {
    return children(
        status,
        <LedgerStatus status={status} text={statusText} />,
        submitHandler
    );
}
