import React from 'react';
import { useRouteMatch } from 'react-router';
import { UpdateBakerRestakeEarnings } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { useAccountName } from '~/utils/dataHooks';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import routes from '~/constants/routes.json';
import { DisplayFromAccount } from './DisplayAccount';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: UpdateBakerRestakeEarnings;
}

/**
 * Displays an overview of an Update-Baker-Restake-Earnings-Transaction.
 */
export default function DisplayUpdateBakerRestakeEarnings({
    transaction,
}: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    return (
        <>
            <DisplayFromAccount
                name={senderName}
                address={transaction.sender}
            />
            <p className={styles.title}>Restake earnings:</p>
            <p className={styles.amount}>
                {transaction.payload.restakeEarnings ? 'Yes' : 'No'}
            </p>
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
