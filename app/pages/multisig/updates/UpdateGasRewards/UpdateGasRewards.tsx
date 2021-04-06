import React, { useMemo } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { rewardFractionResolution } from '~/constants/updateConstants.json';
import { EqualRecord, GasRewards } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import {
    GasRewardFractionField,
    FormGasRewardFractionField,
} from './GasRewardFractionField';
import { noOp } from '~/utils/basicHelpers';

export type UpdateGasRewardsFields = GasRewards;

const fieldNames: EqualRecord<UpdateGasRewardsFields> = {
    baker: 'baker',
    finalizationProof: 'finalizationProof',
    accountCreation: 'accountCreation',
    chainUpdate: 'chainUpdate',
};

const validationRules: RegisterOptions = {
    required: true,
    min: 0,
    max: rewardFractionResolution,
};

// TODO Update the UI when the sketches are complete.
// TODO Do input validation.

/**
 * The component used for creating an update transaction for updating the
 * GAS rewards chain parameters.
 */
export default function UpdateGasRewards({ blockSummary }: UpdateProps) {
    const currentRewards: GasRewards = useMemo(
        () => ({
            baker:
                blockSummary.updates.chainParameters.rewardParameters.gASRewards
                    .baker * rewardFractionResolution,
            finalizationProof:
                blockSummary.updates.chainParameters.rewardParameters.gASRewards
                    .finalizationProof * rewardFractionResolution,
            accountCreation:
                blockSummary.updates.chainParameters.rewardParameters.gASRewards
                    .accountCreation * rewardFractionResolution,
            chainUpdate:
                blockSummary.updates.chainParameters.rewardParameters.gASRewards
                    .chainUpdate * rewardFractionResolution,
        }),
        [blockSummary]
    );

    return (
        <>
            <h3>Current GAS rewards</h3>
            <GasRewardFractionField
                label="Baker"
                value={currentRewards.baker}
                onChange={noOp}
                disabled
            />
            <GasRewardFractionField
                label="Finalization Proof"
                value={currentRewards.finalizationProof}
                onChange={noOp}
                disabled
            />
            <GasRewardFractionField
                label="Account Creation"
                value={currentRewards.accountCreation}
                onChange={noOp}
                disabled
            />
            <GasRewardFractionField
                label="Chain Update"
                value={currentRewards.chainUpdate}
                onChange={noOp}
                disabled
            />
            <h3>New GAS rewards</h3>
            <FormGasRewardFractionField
                name={fieldNames.baker}
                label="Baker"
                defaultValue={currentRewards.baker}
                rules={validationRules}
            />
            <FormGasRewardFractionField
                name={fieldNames.finalizationProof}
                label="Finalization Proof"
                defaultValue={currentRewards.finalizationProof}
                rules={validationRules}
            />
            <FormGasRewardFractionField
                name={fieldNames.accountCreation}
                label="Account Creation"
                defaultValue={currentRewards.accountCreation}
                rules={validationRules}
            />
            <FormGasRewardFractionField
                name={fieldNames.chainUpdate}
                label="Chain Update"
                defaultValue={currentRewards.chainUpdate}
                rules={validationRules}
            />
        </>
    );
}
