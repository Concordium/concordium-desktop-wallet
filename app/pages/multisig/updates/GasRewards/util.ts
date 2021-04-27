import { BlockSummary } from '~/utils/NodeApiTypes';
import { GasRewards } from '~/utils/types';
import { rewardFractionResolution } from '~/constants/updateConstants.json';

export function getCurrentValue(blockSummary: BlockSummary): GasRewards {
    return {
        baker:
            blockSummary.updates.chainParameters.rewardParameters.gASRewards
                .baker,
        finalizationProof:
            blockSummary.updates.chainParameters.rewardParameters.gASRewards
                .finalizationProof,
        accountCreation:
            blockSummary.updates.chainParameters.rewardParameters.gASRewards
                .accountCreation,
        chainUpdate:
            blockSummary.updates.chainParameters.rewardParameters.gASRewards
                .chainUpdate,
    };
}

export function toRewardFractions(gasRewards: GasRewards): GasRewards {
    return (Object.keys(gasRewards) as Array<keyof GasRewards>).reduce(
        (a, c) => ({ ...a, [c]: gasRewards[c] * rewardFractionResolution }),
        {} as GasRewards
    );
}
