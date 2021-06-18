import React from 'react';
import { Account, Fraction } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details } from './shared';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    account?: Account;
    estimatedFee?: Fraction;
    expiryTime?: Date;
}

export default function RemoveBakerProposalDetails({
    account,
    estimatedFee,
    expiryTime,
}: Props) {
    return (
        <Details>
            <AccountDetail title="Account" value={account} first />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
        </Details>
    );
}
