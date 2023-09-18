import React, { useMemo } from 'react';
import { GasRewards } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import GasRewardsForm, {
    UpdateGasRewardsFieldsV0,
    UpdateGasRewardsFieldsV1,
} from './GasRewardsForm';
import { toRewardFractions } from './util';

export type UpdateGasRewardsFields =
    | UpdateGasRewardsFieldsV0
    | UpdateGasRewardsFieldsV1;

/**
 * The component used for creating an update transaction for updating the
 * GAS rewards chain parameters.
 */
export default function UpdateGasRewards({
    defaults,
    chainParameters,
}: UpdateProps) {
    const currentRewards: GasRewards = useMemo(
        () => toRewardFractions(chainParameters),
        [chainParameters]
    );

    const defaultRewards = {
        ...currentRewards,
        ...defaults,
    };

    return (
        <>
            <GasRewardsForm
                title="Current GAS reward fractions"
                disabled
                gasRewards={currentRewards}
            />
            <GasRewardsForm
                title="New GAS reward fractions"
                gasRewards={defaultRewards}
            />
        </>
    );
}
