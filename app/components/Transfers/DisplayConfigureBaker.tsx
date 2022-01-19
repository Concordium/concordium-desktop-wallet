import React from 'react';
import { useRouteMatch } from 'react-router';
import { ConfigureBaker } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayFee from '~/components/DisplayFee';
import { useAccountName } from '~/utils/dataHooks';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import routes from '~/constants/routes.json';
import { DisplayFromAccount } from './DisplayAccount';
import DisplayPublicKey from './DisplayPublicKey';

import styles from './transferDetails.module.scss';
import { fractionResolutionToPercentage } from '~/utils/rewardFractionHelpers';
import { toFixed } from '~/utils/numberStringHelpers';

interface DisplayCommissionProps {
    title: string;
    value?: number;
}

const formatCommission = toFixed(3);

const DisplayCommission = ({ title, value }: DisplayCommissionProps) =>
    value ? (
        <>
            <h5 className={styles.title}>{title}:</h5>
            <p className={styles.amount}>
                {formatCommission(
                    fractionResolutionToPercentage(value).toString()
                )}
                %
            </p>
        </>
    ) : null;

interface Props {
    transaction: ConfigureBaker;
}

/**
 * Displays an overview of an Add-Baker-Transaction.
 */
export default function DisplayConfigureBaker({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    return (
        <>
            <DisplayFromAccount
                address={transaction.sender}
                name={senderName}
            />
            <DisplayFee className={styles.fee} transaction={transaction} />
            {transaction.payload.stake && (
                <>
                    <h5 className={styles.title}>Staked amount:</h5>
                    <p className={styles.amount}>
                        {displayAsGTU(transaction.payload.stake)}
                    </p>
                </>
            )}
            {transaction.payload.restakeEarnings !== undefined && (
                <>
                    <h5 className={styles.title}>Restake earnings:</h5>
                    <p className={styles.amount}>
                        {transaction.payload.restakeEarnings ? 'Yes' : 'No'}
                    </p>
                </>
            )}
            <DisplayCommission
                title="Transaction fee commission"
                value={transaction.payload.transactionFeeCommission}
            />
            <DisplayCommission
                title="Baking reward commission"
                value={transaction.payload.bakingRewardCommission}
            />
            <DisplayCommission
                title="Finalization reward commission"
                value={transaction.payload.finalizationRewardCommission}
            />
            {transaction.payload.metadataUrl !== undefined && (
                <>
                    <h5 className={styles.title}>Metadata URL:</h5>
                    <p className={styles.amount}>
                        {transaction.payload.metadataUrl}
                    </p>
                </>
            )}
            {transaction.payload.electionVerifyKey !== undefined && (
                <DisplayPublicKey
                    name="Election verify key:"
                    publicKey={transaction.payload.electionVerifyKey[0]}
                />
            )}
            {transaction.payload.signatureVerifyKey !== undefined && (
                <DisplayPublicKey
                    name="Election verify key:"
                    publicKey={transaction.payload.signatureVerifyKey[0]}
                />
            )}
            {transaction.payload.aggregationVerifyKey !== undefined && (
                <DisplayPublicKey
                    name="Election verify key:"
                    publicKey={transaction.payload.aggregationVerifyKey[0]}
                />
            )}
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
