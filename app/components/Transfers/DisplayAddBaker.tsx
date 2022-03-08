import React from 'react';
import { useRouteMatch } from 'react-router';
import { AddBaker } from '~/utils/types';
import { displayAsCcd } from '~/utils/ccd';
import DisplayFee from '~/components/DisplayFee';
import { useAccountName } from '~/utils/dataHooks';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import routes from '~/constants/routes.json';
import { DisplayFromAccount } from './DisplayAccount';
import DisplayPublicKey from './DisplayPublicKey';

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
            <DisplayFromAccount
                address={transaction.sender}
                name={senderName}
            />
            <h5 className={styles.title}>Staked amount:</h5>
            <p className={styles.amount}>
                {displayAsCcd(transaction.payload.bakingStake)}
            </p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <h5 className={styles.title}>Restake earnings:</h5>
            <p className={styles.amount}>
                {transaction.payload.restakeEarnings ? 'Yes' : 'No'}
            </p>
            <DisplayPublicKey
                name="Election verify key:"
                publicKey={transaction.payload.electionVerifyKey}
            />
            <DisplayPublicKey
                name="Signature verify key:"
                publicKey={transaction.payload.signatureVerifyKey}
            />
            <DisplayPublicKey
                name="Aggregation verify key:"
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
