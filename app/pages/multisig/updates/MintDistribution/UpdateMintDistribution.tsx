import React from 'react';
import { Validate } from 'react-hook-form';
import { MintDistributionV0 } from '@concordium/node-sdk';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';

import {
    RewardDistributionValue,
    FormRewardDistribution,
    RewardDistribution,
} from '../../common/RewardDistribution';
import MintRateInput, {
    FormMintRateInput,
} from './MintRateInput/MintRateInput';
import {
    getCurrentValue,
    getSlotsPerYear,
    rewardDistributionLabels,
    toRewardDistributionValue,
} from './util';
import { parseMintPerSlot } from '~/utils/mintDistributionHelpers';
import Label from '~/components/Label';

export interface UpdateMintDistributionFields {
    version: 0 | 1;
    mintPerSlot: string;
    rewardDistribution: RewardDistributionValue;
}

const fieldNames: EqualRecord<UpdateMintDistributionFields> = {
    version: 'version',
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

const MINT_PER_SLOT_MAX = 2 ** 32 - 1; // UInt32 upper bound

/**
 * Component for creating an update mint distribution transaction.
 */
export default function UpdateMintDistribution({
    defaults,
    blockSummary,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    const version = consensusStatus.protocolVersion > 3 ? 1 : 0;
    const { mintPerSlot, ...rewardDistribution } = getCurrentValue(
        blockSummary
    ) as MintDistributionV0; // TODO fix if this is supposed to work with delegation protocol.
    const slotsPerYear = getSlotsPerYear(consensusStatus);
    const currentDistribitionRatio: RewardDistributionValue = toRewardDistributionValue(
        rewardDistribution
    );

    return (
        <>
            <div>
                <Label className="mB5">Current mint distribution</Label>
                {version === 0 && (
                    <MintRateInput
                        value={mintPerSlot.toString()}
                        slotsPerYear={slotsPerYear}
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
                {version === 0 && (
                    <FormMintRateInput
                        name={fieldNames.mintPerSlot}
                        defaultValue={
                            defaults.mintPerSlot || mintPerSlot.toString()
                        }
                        slotsPerYear={slotsPerYear}
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
