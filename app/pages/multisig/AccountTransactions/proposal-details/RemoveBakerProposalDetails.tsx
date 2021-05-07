import React from 'react';
import { Account, Fraction, Identity } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details, PlainDetail } from './shared';

interface Props {
    account?: Account;
    identity?: Identity;
    estimatedFee?: Fraction;
}

export default function RemoveBakerProposalDetails({
    identity,
    account,
    estimatedFee,
}: Props) {
    return (
        <Details>
            <PlainDetail title="Identity" value={identity?.name} />
            <AccountDetail title="Account" value={account} />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
        </Details>
    );
}
