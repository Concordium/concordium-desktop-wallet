import React from 'react';
import { Account, Amount, Fraction } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, AmountDetail, Details, formatNote } from './shared';
import { useStakedAmount } from '~/utils/dataHooks';
import { displayAsCCD, microCCDToCCD } from '~/utils/ccd';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    account?: Account;
    stake?: Amount;
    estimatedFee?: Fraction;
    expiryTime?: Date;
}

export default function UpdateBakerStakeProposalDetails({
    account,
    stake,
    estimatedFee,
    expiryTime,
}: Props) {
    return (
        <Details>
            <AccountDetail title="Account" value={account} first />
            <AmountDetail
                title="Amount to stake"
                value={microCCDToCCD(stake)}
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
                    `Increase of ${displayAsCCD(
                        difference
                    )} from ${displayAsCCD(stakedAlready)}`
                )}
            </>
        );
    }
    return (
        <>
            {formatNote(
                `Decrease of ${displayAsCCD(
                    difference * -1n
                )} from ${displayAsCCD(stakedAlready)}`
            )}
        </>
    );
}
