import React from 'react';
import { Account, Fraction, Identity } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details, EnabledDetail, PlainDetail } from './shared';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    identity?: Identity;
    account?: Account;
    restakeEarnings?: boolean;
    estimatedFee?: Fraction;
    expiryTime?: Date;
}

export default function UpdateBakerRestakeEarningsProposalDetails({
    identity,
    account,
    restakeEarnings,
    estimatedFee,
    expiryTime,
}: Props) {
    return (
        <Details>
            <PlainDetail title="Identity" value={identity?.name} />
            <AccountDetail title="Account" value={account} />
            <EnabledDetail title="Restake Earnings" value={restakeEarnings} />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
        </Details>
    );
}
