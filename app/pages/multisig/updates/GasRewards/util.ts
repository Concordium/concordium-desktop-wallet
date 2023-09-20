import { ChainParameters, isChainParametersV2 } from '@concordium/web-sdk';
import { GasRewards } from '~/utils/types';
import updateConstants from '~/constants/updateConstants.json';

// eslint-disable-next-line import/prefer-default-export
export function toRewardFractions(
    chainParameters: ChainParameters
): GasRewards {
    const version = isChainParametersV2(chainParameters) ? 1 : 0;

    const gasRewards = chainParameters.rewardParameters.gASRewards;

    return (Object.keys(gasRewards) as Array<
        keyof Omit<GasRewards, 'version'>
    >).reduce(
        (a, c) => {
            const value = gasRewards[c];
            if (value) {
                return {
                    ...a,
                    [c]: value * updateConstants.rewardFractionResolution,
                };
            }
            return a;
        },
        { version } as GasRewards
    );
}
