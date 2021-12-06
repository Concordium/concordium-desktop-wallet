import React from 'react';
import { useRouteMatch } from 'react-router';
import { RemoveBaker } from '~/utils/types';
import { useAccountName } from '~/utils/dataHooks';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayAddress from '../DisplayAddress';
import routes from '~/constants/routes.json';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: RemoveBaker;
}

/**
 * Displays an overview of remove baker transaction.
 */
export default function DisplayAddBaker({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    return (
        <>
            <p className={styles.title}>From Account:</p>
            <p className={styles.name}>{senderName}</p>
            <DisplayAddress
                address={transaction.sender}
                lineClassName={styles.address}
            />
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
