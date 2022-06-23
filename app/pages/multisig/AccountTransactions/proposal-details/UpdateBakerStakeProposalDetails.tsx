import React from 'react';
import {
    displayAsCcd,
    microCcdToCcd,
} from 'wallet-common-helpers/lib/utils/ccd';
import { Account, Amount, Fraction } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, AmountDetail, Details, formatNote } from './shared';
import { useStakedAmount } from '~/utils/dataHooks';
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
                value={microCcdToCcd(stake)}
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
                    `Increase of ${displayAsCcd(
                        difference
                    )} from ${displayAsCcd(stakedAlready)}`
                )}
            </>
        );
    }
    return (
        <>
            {formatNote(
                `Decrease of ${displayAsCcd(
                    difference * -1n
                )} from ${displayAsCcd(stakedAlready)}`
            )}
        </>
    );
}
