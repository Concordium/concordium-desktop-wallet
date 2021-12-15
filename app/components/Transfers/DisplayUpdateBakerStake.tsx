import React from 'react';
import { useRouteMatch } from 'react-router';
import { UpdateBakerStake } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { useAccountName } from '~/utils/dataHooks';
import { displayAsGTU } from '~/utils/gtu';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayAddress from '../DisplayAddress';
import routes from '~/constants/routes.json';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: UpdateBakerStake;
}

/**
 * Displays an overview of an Update-Baker-Stake-Transaction.
 */
export default function DisplayUpdateBakerStake({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    return (
        <>
            <p className={styles.title}>From account:</p>
            <p className={styles.name}>{senderName}</p>
            <DisplayAddress
                address={transaction.sender}
                lineClassName={styles.address}
            />
            <p className={styles.title}>New staked amount:</p>
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.stake)}
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
