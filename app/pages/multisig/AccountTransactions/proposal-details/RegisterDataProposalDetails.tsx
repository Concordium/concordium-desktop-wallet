import React from 'react';
import { Account, Fraction } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details, PlainDetail } from './shared';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    account?: Account;
    estimatedFee?: Fraction;
    expiryTime?: Date;
    data?: string;
}

export default function RegisterDataProposalDetails({
    account,
    estimatedFee,
    expiryTime,
    data,
}: Props) {
    return (
        <Details>
            <AccountDetail title="Account" value={account} first />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <PlainDetail title="Data" value={data} />
            <DisplayTransactionExpiryTime
                expiryTime={expiryTime}
                placeholder="To be determined"
            />
        </Details>
    );
}
