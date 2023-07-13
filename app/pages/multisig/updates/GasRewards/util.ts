import { GasRewards } from '~/utils/types';
import updateConstants from '~/constants/updateConstants.json';

// eslint-disable-next-line import/prefer-default-export
export function toRewardFractions(gasRewards: GasRewards): GasRewards {
    return (Object.keys(gasRewards) as Array<keyof GasRewards>).reduce(
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
        {} as GasRewards
    );
}
