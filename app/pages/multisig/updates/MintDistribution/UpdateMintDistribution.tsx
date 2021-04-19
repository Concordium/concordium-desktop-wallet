import React from 'react';
// import { Validate } from 'react-hook-form';

import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import { rewardFractionResolution } from '~/constants/updateConstants.json';

import {
    RewardDistributionValue,
    FormRewardDistribution,
    RewardDistribution,
} from '../../common/RewardDistribution';
import MintRateInput from './MintRateInput/MintRateInput';

export interface UpdateMintDistributionFields {
    mantissa: string;
    exponent: string;
    rewardDistribution: RewardDistributionValue;
}

const fieldNames: EqualRecord<UpdateMintDistributionFields> = {
    mantissa: 'mantissa',
    exponent: 'exponent',
    rewardDistribution: 'rewardDistribution',
};

// const isValidNumber = (parseFun: (v: string) => number): Validate => (
//     v: string
// ) => !Number.isNaN(parseFun(v)) || 'Value must be a valid number';

// const isValidFloat = isValidNumber(parseFloat);
// const isValidInteger = isValidNumber((v) => parseInt(v, 10));

const rewardDistributionLabels: [string, string, string] = [
    'Baking Reward Account',
    'Finalization Account Reward',
    'Foundation',
];

/**
 * Component for creating an update mint distribution transaction.
 */
export default function UpdateMintDistribution({
    blockSummary,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    const {
        bakingReward,
        finalizationReward,
        mintPerSlot,
    } = blockSummary.updates.chainParameters.rewardParameters.mintDistribution;

    const slotsPerSecond = 1000 / consensusStatus.slotDuration;
    const slotsPerYear = slotsPerSecond * 60 * 60 * 24 * 365.25;

    const currentDistribitionRatio: RewardDistributionValue = {
        first: bakingReward * rewardFractionResolution,
        second: finalizationReward * rewardFractionResolution,
    };

    return (
        <>
            <div>
                <h3>Current Mint Distribution</h3>
                {mintPerSlot}
                <MintRateInput
                    mintPerSlot={mintPerSlot}
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
                <h3>New Mint Distribution</h3>
                <MintRateInput
                    mintPerSlot={mintPerSlot}
                    slotsPerYear={slotsPerYear}
                    className="mB20"
                />
                <FormRewardDistribution
                    name={fieldNames.rewardDistribution}
                    defaultValue={currentDistribitionRatio}
                    labels={rewardDistributionLabels}
                    rules={{ required: 'Reward distribution is required' }}
                />
            </div>
        </>
    );
}
