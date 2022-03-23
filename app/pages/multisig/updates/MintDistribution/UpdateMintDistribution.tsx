import React from 'react';
import { Validate } from 'react-hook-form';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
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

const MINT_PER_SLOT_MAX = 2 ** 32 - 1; // UInt32 upper bound

/**
 * Component for creating an update mint distribution transaction.
 */
export default function UpdateMintDistribution({
    defaults,
    blockSummary,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    // Use the mintPerSlot as an indicator of whether to use v0 (which has mintPerSlot) or v1 (which doesn't)
    let mintPerSlot: number | undefined;
    const rewardDistribution =
        blockSummary.updates.chainParameters.rewardParameters.mintDistribution;
    if (!isBlockSummaryV1(blockSummary)) {
        mintPerSlot =
            blockSummary.updates.chainParameters.rewardParameters
                .mintDistribution.mintPerSlot;
    }
    const slotsPerYear = getSlotsPerYear(consensusStatus);
    const currentDistribitionRatio: RewardDistributionValue = toRewardDistributionValue(
        rewardDistribution
    );

    return (
        <>
            <div>
                <Label className="mB5">Current mint distribution</Label>
                {mintPerSlot !== undefined && (
                    <MintRateInput
                        value={mintPerSlot.toString()}
                        paydaysPerYear={slotsPerYear}
                        disabled
                        className="mB20"
                    />
                )}
                <RewardDistribution
                    labels={rewardDistributionLabels}
                    value={currentDistribitionRatio}
                    disabled
                />
            </div>
            <div>
                <Label className="mB5">New mint distribution</Label>
                {mintPerSlot !== undefined && (
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
                )}
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
