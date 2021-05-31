import React from 'react';
import { Account, Amount, Fraction, Identity } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    AccountDetail,
    AmountDetail,
    Details,
    formatNote,
    PlainDetail,
} from './shared';
import { useStakedAmount } from '~/utils/hooks';
import { displayAsGTU, microGtuToGtu } from '~/utils/gtu';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    identity?: Identity;
    account?: Account;
    stake?: Amount;
    estimatedFee?: Fraction;
    expiryTime?: Date;
}

export default function UpdateBakerStakeProposalDetails({
    identity,
    account,
    stake,
    estimatedFee,
    expiryTime,
}: Props) {
    return (
        <Details>
            <PlainDetail title="Identity" value={identity?.name} />
            <AccountDetail title="Account" value={account} />
            <AmountDetail
                title="Amount to stake"
                value={microGtuToGtu(stake)}
            />
            {account !== undefined && stake !== undefined ? (
                <StakedAmountNote
                    accountAddress={account.address}
                    stake={stake}
                />
            ) : null}
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
        </Details>
    );
}

type StakedAmountNoteProps = {
    accountAddress: string;
    stake: Amount;
};

function StakedAmountNote({ accountAddress, stake }: StakedAmountNoteProps) {
    const stakedAlready = useStakedAmount(accountAddress);

    if (stakedAlready === undefined) {
        return <>{formatNote('Loading current stake')}</>;
    }
    if (stakedAlready === stake) {
        return null;
    }

    const difference = stake - stakedAlready;

    if (difference > 0) {
        return (
            <>
                {formatNote(
                    `Increase of ${displayAsGTU(
                        difference
                    )} from ${displayAsGTU(stakedAlready)}`
                )}
            </>
        );
    }
    return (
        <>
            {formatNote(
                `Decrease of ${displayAsGTU(
                    difference * -1n
                )} from ${displayAsGTU(stakedAlready)}`
            )}{' '}
        </>
    );
}
