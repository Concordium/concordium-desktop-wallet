import React from 'react';
import { MintDistributionV0 } from '@concordium/node-sdk';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import {
    getCurrentValue,
    getSlotsPerYear,
    rewardDistributionLabels,
    toRewardDistributionValue,
} from './util';
import {
    RewardDistribution,
    RewardDistributionValue,
} from '../../common/RewardDistribution';
import MintRateInput from './MintRateInput';
import Label from '~/components/Label';
import { MintDistribution } from '~/utils/types';

interface Props extends ChainData {
    mintDistribution: MintDistribution; // TODO fix if this is supposed to work with delegation protocol
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
    const slotsPerYear = getSlotsPerYear(consensusStatus);

    const {
        mintPerSlot: currentMintPerSlot,
        ...currentRewardDistribution
    } = getCurrentValue(blockSummary) as MintDistributionV0; // TODO fix if this is supposed to work with delegation protocol
    const currentDistribitionRatio: RewardDistributionValue = toRewardDistributionValue(
        currentRewardDistribution
    );

    const {
        mintPerSlot: newMintRate,
        bakingReward,
        finalizationReward,
    } = mintDistribution;
    const newMintPerSlot = `${newMintRate.mantissa}e-${newMintRate.exponent}`;
    const newDistribitionRatio: RewardDistributionValue = {
        first: bakingReward,
        second: finalizationReward,
    };

    return (
        <>
            <div>
                <Label className="mB5">Current mint distribution:</Label>
                <MintRateInput
                    value={currentMintPerSlot.toString()}
                    slotsPerYear={slotsPerYear}
                    disabled
                    className="mB20"
                />
                <RewardDistribution
                    labels={rewardDistributionLabels}
                    value={currentDistribitionRatio}
                    disabled
                />
            </div>
            <div>
                <Label className="mB5">New mint distribution:</Label>
                <MintRateInput
                    value={newMintPerSlot.toString()}
                    slotsPerYear={slotsPerYear}
                    disabled
                    className="mB20"
                />
                <RewardDistribution
                    labels={rewardDistributionLabels}
                    value={newDistribitionRatio}
                    disabled
                />
            </div>
        </>
    );
});
