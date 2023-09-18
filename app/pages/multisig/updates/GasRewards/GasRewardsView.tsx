import React from 'react';
import { GasRewards } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import GasRewardsForm from './GasRewardsForm';
import Loading from '~/cross-app-components/Loading';
import { toRewardFractions } from './util';

interface Props extends ChainData {
    gasRewards: GasRewards;
}

/**
 * Displays an overview of a gas rewards transaction payload.
 */
export default withChainData(function GasRewardsView({
    gasRewards,
    chainParameters,
}: Props) {
    if (!chainParameters) {
        return <Loading inline />;
    }

    const currentValue = toRewardFractions(chainParameters);

    return (
        <>
            <GasRewardsForm
                title="Current GAS reward fractions:"
                display
                gasRewards={currentValue}
            />
            <GasRewardsForm
                title="New GAS reward fractions:"
                display
                gasRewards={gasRewards}
            />
        </>
    );
});
