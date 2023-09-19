import React from 'react';
import { Validate } from 'react-hook-form';
import { isChainParametersV0, isConsensusStatusV0 } from '@concordium/web-sdk';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';

import {
    RewardDistributionValue,
    FormRewardDistribution,
    RewardDistribution,
} from '../../common/RewardDistribution';
import MintRateInput, { FormMintRateInput } from '../common/MintRateInput';
import {
    getSlotsPerYear,
    rewardDistributionLabels,
    toRewardDistributionValue,
} from './util';
import { parseMintRate } from '~/utils/mintDistributionHelpers';
import Label from '~/components/Label';
import { UINT32_MAX } from '~/utils/basicHelpers';

export interface UpdateMintDistributionFields {
    mintPerSlot: string;
    rewardDistribution: RewardDistributionValue;
}

const fieldNames: EqualRecord<UpdateMintDistributionFields> = {
    mintPerSlot: 'mintPerSlot',
    rewardDistribution: 'rewardDistribution',
};

const canParseMintPerSlot: Validate = (value?: string) =>
    (value !== undefined && parseMintRate(value) !== undefined) ||
    'Invalid mint per slot value';

const isValidNumber = (parseFun: (v: string) => number): Validate => (
    v: string
) => !Number.isNaN(parseFun(v)) || 'Value must be a valid number';

const isValidFloat = isValidNumber(parseFloat);

const MINT_PER_SLOT_MAX = UINT32_MAX;

/**
 * Component for creating an update mint distribution transaction.
 */
export default function UpdateMintDistribution({
    defaults,
    chainParameters,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    const rewardDistribution =
        chainParameters.rewardParameters.mintDistribution;

    const currentDistribitionRatio: RewardDistributionValue = toRewardDistributionValue(
        rewardDistribution
    );

    if (
        isChainParametersV0(chainParameters) &&
        isConsensusStatusV0(consensusStatus)
    ) {
        const {
            mintPerSlot,
        } = chainParameters.rewardParameters.mintDistribution;
        const slotsPerYear = getSlotsPerYear(consensusStatus);

        return (
            <>
                <div>
                    <Label className="mB5">Current mint distribution</Label>
                    <MintRateInput
                        value={mintPerSlot.toString()}
                        paydaysPerYear={getSlotsPerYear(consensusStatus)}
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
                    <Label className="mB5">New mint distribution</Label>
                    <FormMintRateInput
                        name={fieldNames.mintPerSlot}
                        defaultValue={
                            defaults.mintPerSlot || mintPerSlot.toString()
                        }
                        paydaysPerYear={slotsPerYear}
                        className="mB20"
                        rules={{
                            required: 'Mint per slot value is required',
                            min: {
                                value: 0,
                                message:
                                    "Mint per slot value can't be negative",
                            },
                            max: {
                                value: MINT_PER_SLOT_MAX,
                                message: `Mint per slot cannot exceed ${MINT_PER_SLOT_MAX}`,
                            },
                            validate: {
                                isValidFloat,
                                canParseMintPerSlot,
                            },
                        }}
                    />
                    <FormRewardDistribution
                        name={fieldNames.rewardDistribution}
                        defaultValue={
                            defaults.rewardDistribution ||
                            currentDistribitionRatio
                        }
                        labels={rewardDistributionLabels}
                        rules={{ required: 'Reward distribution is required' }}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <div>
                <Label className="mB5">Current mint distribution</Label>
                <RewardDistribution
                    labels={rewardDistributionLabels}
                    value={currentDistribitionRatio}
                    disabled
                />
            </div>
            <div>
                <Label className="mB5">New mint distribution</Label>
                <FormRewardDistribution
                    name={fieldNames.rewardDistribution}
                    defaultValue={
                        defaults.rewardDistribution || currentDistribitionRatio
                    }
                    labels={rewardDistributionLabels}
                    rules={{ required: 'Reward distribution is required' }}
                />
            </div>
        </>
    );
}
