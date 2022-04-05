import React from 'react';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { MintDistribution } from '~/utils/types';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import {
    getSlotsPerYear,
    rewardDistributionLabels,
    toRewardDistributionValue,
} from './util';
import {
    RewardDistribution,
    RewardDistributionValue,
} from '../../common/RewardDistribution';
import MintRateInput from '../common/MintRateInput';
import Label from '~/components/Label';
import { stringifyMintRate } from '~/utils/mintDistributionHelpers';

interface Props extends ChainData {
    mintDistribution: MintDistribution;
}

/**
 * Displays an overview of a mint distribution transaction payload.
 */
export default withChainData(function MintDistributionView({
    mintDistribution,
    blockSummary,
    consensusStatus,
}: Props) {
    if (!consensusStatus || !blockSummary) {
        return <Loading />;
    }
    if (isBlockSummaryV1(blockSummary) && mintDistribution.version === 0) {
        throw new Error(
            'Viewing mint distribution update version 0, which is outdated.'
        );
    }

    const slotsPerYear = getSlotsPerYear(consensusStatus);

    const currentDistribitionRatio: RewardDistributionValue = toRewardDistributionValue(
        blockSummary.updates.chainParameters.rewardParameters.mintDistribution
    );

    const { bakingReward, finalizationReward } = mintDistribution;
    // TODO: const newMintPerSlot = `${newMintRate.mantissa}e-${newMintRate.exponent}`;
    const newDistribitionRatio: RewardDistributionValue = {
        first: bakingReward,
        second: finalizationReward,
    };

    return (
        <>
            <div>
                <Label className="mB5">Current mint distribution:</Label>
                {isBlockSummaryV1(blockSummary) || (
                    <MintRateInput
                        value={blockSummary.updates.chainParameters.rewardParameters.mintDistribution.mintPerSlot.toString()}
                        paydaysPerYear={slotsPerYear}
                        disabled
                        className="mB20"
                    />
                )}
                <RewardDistribution
                    labels={rewardDistributionLabels}
                    value={currentDistribitionRatio}
                    disabled
                />
            </div>
            <div>
                <Label className="mB5">New mint distribution:</Label>
                {mintDistribution.version === 0 && (
                    <MintRateInput
                        value={stringifyMintRate(mintDistribution.mintPerSlot)}
                        paydaysPerYear={slotsPerYear}
                        disabled
                        className="mB20"
                    />
                )}
                <RewardDistribution
                    labels={rewardDistributionLabels}
                    value={newDistribitionRatio}
                    disabled
                />
            </div>
        </>
    );
});
