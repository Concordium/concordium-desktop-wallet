import React from 'react';
import { useRouteMatch } from 'react-router';
import { AddBaker } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayFee from '~/components/DisplayFee';
import { useAccountName } from '~/utils/dataHooks';
import PublicKey from '~/pages/multisig/common/PublicKey/PublicKey';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayAddress from '../DisplayAddress';
import routes from '~/constants/routes.json';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: AddBaker;
}

/**
 * Displays an overview of an Add-Baker-Transaction.
 */
export default function DisplayAddBaker({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    return (
        <>
            <h5 className={styles.title}>From account:</h5>
            <p className={styles.name}>{senderName}</p>
            <DisplayAddress
                address={transaction.sender}
                lineClassName={styles.address}
            />
            <h5 className={styles.title}>Staked amount:</h5>
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.bakingStake)}
            </p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <h5 className={styles.title}>Restake earnings:</h5>
            <p className={styles.amount}>
                {transaction.payload.restakeEarnings ? 'Yes' : 'No'}
            </p>
            <h5 className={styles.title}>Public keys:</h5>
            <PublicKey
                name="Election verify key"
                publicKey={transaction.payload.electionVerifyKey}
            />
            <PublicKey
                name="Signature verify key"
                publicKey={transaction.payload.signatureVerifyKey}
            />
            <PublicKey
                name="Aggregation verify key"
                publicKey={transaction.payload.aggregationVerifyKey}
            />
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
