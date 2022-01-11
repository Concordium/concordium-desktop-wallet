import React from 'react';
import { Account, Fraction } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details, EnabledDetail } from './shared';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    account?: Account;
    restakeEarnings?: boolean;
    estimatedFee?: Fraction;
    expiryTime?: Date;
}

export default function UpdateBakerRestakeEarningsProposalDetails({
    account,
    restakeEarnings,
    estimatedFee,
    expiryTime,
}: Props) {
    return (
        <Details>
            <AccountDetail title="Account" value={account} first />
            <EnabledDetail title="Restake earnings" value={restakeEarnings} />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
        </Details>
    );
}
