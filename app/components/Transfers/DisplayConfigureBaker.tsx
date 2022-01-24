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
import {
    displayPoolOpen,
    displayRestakeEarnings,
} from '~/utils/transactionFlows/addBaker';
import DisplayBakerCommission from './DisplayBakerCommission';

interface Props {
    transaction: ConfigureBaker;
}

/**
 * Displays an overview of an Add-Baker-Transaction.
 */
export default function DisplayConfigureBaker({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    const { payload, expiry } = transaction;

    return (
        <>
            <DisplayFromAccount
                address={transaction.sender}
                name={senderName}
            />
            <DisplayFee className={styles.fee} transaction={transaction} />
            {payload.stake && (
                <>
                    <h5 className={styles.title}>Staked amount:</h5>
                    <p className={styles.amount}>
                        {displayAsGTU(payload.stake)}
                    </p>
                </>
            )}
            {payload.restakeEarnings !== undefined && (
                <>
                    <h5 className={styles.title}>Restake earnings:</h5>
                    <p className={styles.amount}>
                        {displayRestakeEarnings(payload.restakeEarnings)}
                    </p>
                </>
            )}
            {payload.openForDelegation !== undefined && (
                <>
                    <h5 className={styles.title}>Pool delegation status:</h5>
                    <p className={styles.amount}>
                        {displayPoolOpen(payload.openForDelegation)}
                    </p>
                </>
            )}
            <DisplayBakerCommission
                title="Transaction fee commission"
                value={transaction.payload.transactionFeeCommission}
            />
            <DisplayBakerCommission
                title="Baking reward commission"
                value={transaction.payload.bakingRewardCommission}
            />
            <DisplayBakerCommission
                title="Finalization reward commission"
                value={transaction.payload.finalizationRewardCommission}
            />
            {payload.metadataUrl !== undefined && (
                <>
                    <h5 className={styles.title}>Metadata URL:</h5>
                    <p className={styles.amount}>{payload.metadataUrl}</p>
                </>
            )}
            <DisplayPublicKey
                name="Election verify key:"
                publicKey={payload?.electionVerifyKey?.[0]}
            />
            <DisplayPublicKey
                name="Signature verify key:"
                publicKey={payload?.signatureVerifyKey?.[0]}
            />
            <DisplayPublicKey
                name="Aggregation verify key:"
                publicKey={payload?.aggregationVerifyKey?.[0]}
            />
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(expiry)}
                />
            )}
        </>
    );
}
