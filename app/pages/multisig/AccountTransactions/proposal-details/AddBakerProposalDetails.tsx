import React from 'react';
import { Account, BakerVerifyKeys, Fraction } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    AccountDetail,
    AmountDetail,
    Details,
    EnabledDetail,
    PlainDetail,
} from './shared';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import DisplayPublicKey from '~/components/Transfers/DisplayPublicKey';

interface Props {
    account?: Account;
    stake?: string;
    estimatedFee?: Fraction;
    restakeEarnings?: boolean;
    expiryTime?: Date;
    bakerVerifyKeys?: BakerVerifyKeys;
}

export default function AddBakerProposalDetails({
    account,
    stake,
    estimatedFee,
    restakeEarnings,
    expiryTime,
    bakerVerifyKeys,
}: Props) {
    return (
        <Details>
            <AccountDetail title="Account" value={account} first />
            <AmountDetail title="Amount to stake" value={stake} />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <EnabledDetail title="Restake earnings" value={restakeEarnings} />
            {bakerVerifyKeys ? (
                <>
                    <DisplayPublicKey
                        name="Election verify key"
                        publicKey={bakerVerifyKeys.electionVerifyKey}
                    />
                    <DisplayPublicKey
                        name="Signature verify key"
                        publicKey={bakerVerifyKeys.signatureVerifyKey}
                    />
                    <DisplayPublicKey
                        name="Aggregation verify key"
                        publicKey={bakerVerifyKeys.aggregationVerifyKey}
                    />
                </>
            ) : (
                <PlainDetail title="Public keys" />
            )}
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
        </Details>
    );
}
