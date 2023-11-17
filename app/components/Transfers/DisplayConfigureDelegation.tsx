import React from 'react';
import { useRouteMatch } from 'react-router';
import { ConfigureDelegation } from '~/utils/types';
import DisplayFee from '~/components/DisplayFee';
import { useAccountName } from '~/utils/dataHooks';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import routes from '~/constants/routes.json';
import DisplayAccount from './DisplayAccount';
import {
    displayDelegationTarget,
    displayRedelegate,
    isPassiveDelegation,
} from '~/utils/transactionFlows/configureDelegation';
import { displayAsCcd } from '~/utils/ccd';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: ConfigureDelegation;
}

export default function DisplayConfigureDelegation({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    const { payload, expiry } = transaction;

    return (
        <>
            <DisplayAccount
                address={transaction.sender}
                name={senderName}
                label="Account:"
            />
            <DisplayFee className={styles.fee} transaction={transaction} />
            {payload.delegationTarget !== undefined && (
                <>
                    <h5 className={styles.title}>Delegation target:</h5>
                    <p className={styles.amount}>
                        {displayDelegationTarget(payload.delegationTarget)}
                    </p>
                    {!isPassiveDelegation(payload.delegationTarget) && (
                        <p className={styles.amount}>(Baker ID)</p>
                    )}
                </>
            )}

            {payload.stake !== undefined &&
                (payload.stake === 0n ? (
                    <>
                        <h5 className={styles.title}>Stop delegation</h5>
                    </>
                ) : (
                    <>
                        <h5 className={styles.title}>Delegated amount:</h5>
                        <p className={styles.amount}>
                            {displayAsCcd(payload.stake)}
                        </p>
                    </>
                ))}
            {payload.restakeEarnings !== undefined && (
                <>
                    <h5 className={styles.title}>Redelegate earnings:</h5>
                    <p className={styles.amount}>
                        {displayRedelegate(payload.restakeEarnings)}
                    </p>
                </>
            )}
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(expiry)}
                />
            )}
        </>
    );
}
