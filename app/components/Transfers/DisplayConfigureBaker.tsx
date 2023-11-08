import React from 'react';
import { useRouteMatch } from 'react-router';
import { ConfigureBaker } from '~/utils/types';
import DisplayFee from '~/components/DisplayFee';
import { useAccountName } from '~/utils/dataHooks';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import routes from '~/constants/routes.json';
import DisplayAccount from './DisplayAccount';
import DisplayPublicKey from './DisplayPublicKey';
import {
    displayPoolOpen,
    displayRestakeEarnings,
} from '~/utils/transactionFlows/configureBaker';
import DisplayBakerCommission from './DisplayBakerCommission';
import DisplayMetadataUrl from './DisplayMetadataUrl';
import { displayAsCcd } from '~/utils/ccd';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: ConfigureBaker;
}

export default function DisplayConfigureBaker({ transaction }: Props) {
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
            {payload.stake !== undefined &&
                (payload.stake === 0n ? (
                    <>
                        <h5 className={styles.title}>Stop Validation</h5>
                        <h5 className={styles.subtitle}>(Stop baking)</h5>
                    </>
                ) : (
                    <>
                        <h5 className={styles.title}>Staked amount:</h5>
                        <p className={styles.amount}>
                            {displayAsCcd(payload.stake)}
                        </p>
                    </>
                ))}
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
                    <h5 className={styles.title}>Pool status:</h5>
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
                title="Block reward commission"
                value={transaction.payload.bakingRewardCommission}
            />
            <h5 className={styles.subtitle}>(Baker reward commission)</h5>
            <DisplayBakerCommission
                title="Finalization reward commission"
                value={transaction.payload.finalizationRewardCommission}
            />
            <DisplayMetadataUrl metadataUrl={payload.metadataUrl} />

            {payload.keys !== undefined && (
                <>
                    <h5 className={styles.title}>Update validator keys</h5>
                    <h5 className={styles.subtitle}>(Update baker keys)</h5>
                </>
            )}
            <DisplayPublicKey
                name="Election verify key:"
                publicKey={payload?.keys?.electionVerifyKey}
            />
            <DisplayPublicKey
                name="Signature verify key:"
                publicKey={payload?.keys?.signatureVerifyKey}
            />
            <DisplayPublicKey
                name="Aggregation verify key:"
                publicKey={payload?.keys?.aggregationVerifyKey}
            />
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(expiry)}
                />
            )}
        </>
    );
}
