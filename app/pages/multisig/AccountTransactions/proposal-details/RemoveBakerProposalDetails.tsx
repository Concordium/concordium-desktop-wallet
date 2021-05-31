import React from 'react';
import { Account, Fraction, Identity } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details, PlainDetail } from './shared';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    account?: Account;
    identity?: Identity;
    estimatedFee?: Fraction;
    expiryTime?: Date;
}

export default function RemoveBakerProposalDetails({
    identity,
    account,
    estimatedFee,
    expiryTime,
}: Props) {
    return (
        <Details>
            <PlainDetail title="Identity" value={identity?.name} />
            <AccountDetail title="Account" value={account} />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
        </Details>
    );
}
