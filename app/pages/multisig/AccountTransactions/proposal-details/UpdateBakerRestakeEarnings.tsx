import React from 'react';
import { Account, Fraction, Identity } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details, EnabledDetail, PlainDetail } from './shared';

interface Props {
    identity?: Identity;
    account?: Account;
    restakeEarnings?: boolean;
    estimatedFee?: Fraction;
}

export default function UpdateBakerRestakeEarningsProposalDetails({
    identity,
    account,
    restakeEarnings,
    estimatedFee,
}: Props) {
    return (
        <Details>
            <PlainDetail title="Identity" value={identity?.name} />
            <AccountDetail title="Account" value={account} />
            <EnabledDetail title="Restake Earnings" value={restakeEarnings} />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
        </Details>
    );
}
