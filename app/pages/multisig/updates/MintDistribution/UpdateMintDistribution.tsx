import React from 'react';
// import { Validate } from 'react-hook-form';

import { EqualRecord, MintRate } from '~/utils/types';
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
    const currentMintDistribution =
        blockSummary.updates.chainParameters.rewardParameters.mintDistribution;

    // TODO Parse the current mint distribution value instead of hardcording this value.
    const mintRate: MintRate = {
        mantissa: 7555999,
        exponent: -16,
    };
    const slotsPerSecond = 1000 / consensusStatus.slotDuration;
    const slotsPerYear = slotsPerSecond * 60 * 60 * 24 * 365.25;

    const currentValue: RewardDistributionValue = {
        first: currentMintDistribution.bakingReward * rewardFractionResolution,
        second:
            currentMintDistribution.finalizationReward *
            rewardFractionResolution,
    };

    return (
        <>
            <div>
                <h3>Current Mint Distribution</h3>
                <MintRateInput
                    mantissa={mintRate.mantissa.toString()}
                    exponent={mintRate.exponent.toString()}
                    slotsPerYear={slotsPerYear.toString()}
                    disabled
                    className="mB20"
                />
                <RewardDistribution
                    labels={rewardDistributionLabels}
                    value={currentValue}
                    disabled
                />
            </div>
            <div>
                <h3>New Mint Distribution</h3>
                <MintRateInput
                    mantissa={mintRate.mantissa.toString()}
                    exponent={mintRate.exponent.toString()}
                    slotsPerYear={slotsPerYear.toString()}
                    className="mB20"
                />
                <FormRewardDistribution
                    name={fieldNames.rewardDistribution}
                    defaultValue={currentValue}
                    labels={rewardDistributionLabels}
                    rules={{ required: 'Reward distribution is required' }}
                />
            </div>
        </>
    );
}
