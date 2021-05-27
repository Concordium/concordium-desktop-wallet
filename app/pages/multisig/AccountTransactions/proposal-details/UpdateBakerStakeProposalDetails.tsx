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
import { displayAsGTU, microGtuToGtu } from '~/utils/gtu';
import { epochDate, getEpochIndexAt } from '~/utils/basicHelpers';
import { getFormattedDateString } from '~/utils/timeHelpers';

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
    const message = formatNote(
        `Decrease of ${displayAsGTU(difference * -1n)} from ${displayAsGTU(
            stakedAlready
        )}`
    );

    if (lastFinalizedBlockSummary === undefined) {
        return <>{message}</>;
    }

    const { consensusStatus } = lastFinalizedBlockSummary;
    const {
        chainParameters,
    } = lastFinalizedBlockSummary.lastFinalizedBlockSummary.updates;
    const genesisTime = new Date(consensusStatus.genesisTime);
    const currentEpochIndex = getEpochIndexAt(
        now,
        consensusStatus.epochDuration,
        genesisTime
    );
    const nextEpochIndex = currentEpochIndex + 1;

    const cooldownUntilEpochIndex =
        nextEpochIndex + chainParameters.bakerCooldownEpochs;

    const cooldownUntil = epochDate(
        cooldownUntilEpochIndex,
        consensusStatus.epochDuration,
        genesisTime
    );
    return (
        <>
            {message}
            {formatNote(
                `The baker stake will be frozen until ${getFormattedDateString(
                    cooldownUntil
                )} where the actual decrease will take effect.`
            )}
        </>
    );
}
