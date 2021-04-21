import React from 'react';
// import { Validate } from 'react-hook-form';

import { Validate } from 'react-hook-form';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import { rewardFractionResolution } from '~/constants/updateConstants.json';

import {
    RewardDistributionValue,
    FormRewardDistribution,
    RewardDistribution,
} from '../../common/RewardDistribution';
import MintRateInput, {
    FormMintRateInput,
} from './MintRateInput/MintRateInput';
import { getCurrentValue, getSlotsPerYear } from './util';
import { parseMintPerSlot } from '~/utils/mintDistributionHelpers';

export interface UpdateMintDistributionFields {
    mintPerSlot: string;
    rewardDistribution: RewardDistributionValue;
}

const fieldNames: EqualRecord<UpdateMintDistributionFields> = {
    mintPerSlot: 'mintPerSlot',
    rewardDistribution: 'rewardDistribution',
};

const canParseMintPerSlot: Validate = (value?: string) =>
    (value !== undefined && parseMintPerSlot(value) !== undefined) ||
    'Invalid mint per slot value';

const isValidNumber = (parseFun: (v: string) => number): Validate => (
    v: string
) => !Number.isNaN(parseFun(v)) || 'Value must be a valid number';

const isValidFloat = isValidNumber(parseFloat);

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
    const { bakingReward, finalizationReward, mintPerSlot } = getCurrentValue(
        blockSummary
    );
    const slotsPerYear = getSlotsPerYear(consensusStatus);

    const currentDistribitionRatio: RewardDistributionValue = {
        first: bakingReward * rewardFractionResolution,
        second: finalizationReward * rewardFractionResolution,
    };

    return (
        <>
            <div>
                <h5>Current Mint Distribution</h5>
                <MintRateInput
                    value={mintPerSlot.toString()}
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
                <h5>New Mint Distribution</h5>
                <FormMintRateInput
                    name={fieldNames.mintPerSlot}
                    defaultValue={mintPerSlot.toString()}
                    slotsPerYear={slotsPerYear}
                    className="mB20"
                    rules={{
                        required: 'Mint rate value is required',
                        min: {
                            value: 0,
                            message: "Mint rate value can't be negative",
                        },
                        validate: {
                            isValidFloat,
                            canParseMintPerSlot,
                        },
                    }}
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
