import React from 'react';
import { Account, BakerVerifyKeys, Fraction, Identity } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    AccountDetail,
    AmountDetail,
    Details,
    EnabledDetail,
    PlainDetail,
} from './shared';
import PublicKey from '../../common/PublicKey/PublicKey';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    account?: Account;
    identity?: Identity;
    stake?: string;
    estimatedFee?: Fraction;
    restakeEarnings?: boolean;
    expiryTime?: Date;
    bakerVerifyKeys?: BakerVerifyKeys;
}

export default function AddBakerProposalDetails({
    identity,
    account,
    stake,
    estimatedFee,
    restakeEarnings,
    expiryTime,
    bakerVerifyKeys,
}: Props) {
    return (
        <Details>
            <PlainDetail title="Identity" value={identity?.name} />
            <AccountDetail title="Account" value={account} />
            <AmountDetail title="Amount to stake" value={stake} />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <EnabledDetail title="Restake earnings" value={restakeEarnings} />
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
            <PlainDetail
                title="Public keys"
                value={bakerVerifyKeys}
                format={(bakerKeys) => (
                    <>
                        <PublicKey
                            name="Election verify key"
                            publicKey={bakerKeys.electionVerifyKey}
                        />
                        <PublicKey
                            name="Signature verify key"
                            publicKey={bakerKeys.signatureVerifyKey}
                        />
                        <PublicKey
                            name="Aggregation verify key"
                            publicKey={bakerKeys.aggregationVerifyKey}
                        />
                    </>
                )}
            />
        </Details>
    );
}
