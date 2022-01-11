import clsx from 'clsx';
import React from 'react';
import {
    dateFromTimeStamp,
    getFormattedDateString,
    getNow,
} from '~/utils/timeHelpers';
import {
    TimeStampUnit,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '~/utils/types';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

import styles from './UpdateInstructionDetails.module.scss';
import { PlainDetail } from '~/pages/multisig/AccountTransactions/proposal-details/shared';

interface Props {
    transaction: UpdateInstruction<UpdateInstructionPayload>;
}

/**
 * Component that displays the details of an UpdateInstruction in a human readable way.
 * @param {UpdateInstruction} transaction: The transaction, which details is displayed.
 */
export default function UpdateInstructionDetails({
    transaction,
}: Props): JSX.Element {
    const handler = findUpdateInstructionHandler(transaction.type);
    const effective = dateFromTimeStamp(transaction.header.effectiveTime);
    const expiry = dateFromTimeStamp(transaction.header.timeout);
    const isExpired = effective.valueOf() < getNow(TimeStampUnit.milliSeconds);

    return (
        <div className={styles.root}>
            {handler.view(transaction)}
            <div>
                <PlainDetail
                    title="Effective time"
                    value={getFormattedDateString(effective)}
                    format={(d) => (
                        <span
                            className={clsx(
                                'boyd3 mono',
                                isExpired && 'textError'
                            )}
                        >
                            {d}
                        </span>
                    )}
                />
            </div>
            <div>
                <DisplayTransactionExpiryTime expiryTime={expiry} />
            </div>
        </div>
    );
}
