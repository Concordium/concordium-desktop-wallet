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
import {
    useCurrentTime,
    useLastFinalizedBlockSummary,
    useStakedAmount,
} from '~/utils/hooks';
import { displayAsGTU, toGTUString } from '~/utils/gtu';

/** Calculates the epoch index from a given date */
export function getEpochIndexAt(
    epochAtDate: Date,
    epochDurationMillis: number,
    genesisTime: Date
) {
    const genesis = genesisTime.getTime();
    const now = epochAtDate.getTime();
    const millisSinceGenesis = now - genesis;
    return Math.floor(millisSinceGenesis / epochDurationMillis);
}

/** Calculates the start date of an epoch index */
function epochDate(
    epochIndex: number,
    epochDurationMillis: number,
    genesisTime: Date
): Date {
    return new Date(genesisTime.getTime() + epochIndex * epochDurationMillis);
}

interface Props {
    identity?: Identity;
    account?: Account;
    stake?: Amount;
    estimatedFee?: Fraction;
}

export default function UpdateBakerStakeProposalDetails({
    identity,
    account,
    stake,
    estimatedFee,
}: Props) {
    return (
        <Details>
            <PlainDetail title="Identity" value={identity?.name} />
            <AccountDetail title="Account" value={account} />
            <AmountDetail title="Amount to stake" value={toGTUString(stake)} />
            {account !== undefined && stake !== undefined ? (
                <StakedAmountNote
                    accountAddress={account.address}
                    stake={stake}
                />
            ) : null}
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
        </Details>
    );
}

type StakedAmountNoteProps = {
    accountAddress: string;
    stake: Amount;
};

function StakedAmountNote({ accountAddress, stake }: StakedAmountNoteProps) {
    const stakedAlready = useStakedAmount(accountAddress);
    const lastFinalizedBlockSummary = useLastFinalizedBlockSummary();
    const now = useCurrentTime(60000);

    if (stakedAlready === undefined) {
        return <>{formatNote('Loading current stake')}</>;
    }
    if (stakedAlready === stake) {
        return null;
    }

    const difference = stake - stakedAlready;

    if (difference > 0) {
        return <>{formatNote(`Increase of ${displayAsGTU(difference)}`)}</>;
    }
    const message = formatNote(
        `Decrease of ${displayAsGTU(difference)}, this will result in the stake`
    );

    if (lastFinalizedBlockSummary === undefined) {
        return <>{message}</>;
    }
    const {
        chainParameters,
    } = lastFinalizedBlockSummary.lastFinalizedBlockSummary.updates;

    if (chainParameters.minimumThresholdForBaking > stake) {
        return (
            <>
                {message}
                {formatNote('New stake is below the minimum threshold')}
            </>
        );
    }
    const { consensusStatus } = lastFinalizedBlockSummary;
    const currentEpochIndex = getEpochIndexAt(
        now,
        consensusStatus.epochDuration,
        new Date(consensusStatus.genesisTime)
    );

    const cooldownUntilEpochIndex =
        currentEpochIndex + chainParameters.bakerCooldownEpochs;

    const cooldownUntil = epochDate(
        Number(cooldownUntilEpochIndex),
        consensusStatus.epochDuration,
        new Date(consensusStatus.genesisTime)
    );
    return (
        <>
            {message}
            {formatNote(
                `The staked amount will be frozen until ${cooldownUntil}`
            )}
        </>
    );
}
