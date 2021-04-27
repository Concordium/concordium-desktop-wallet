import { RegisterOptions, useFormContext } from 'react-hook-form';
import React from 'react';
import { EqualRecord, GasRewards } from '~/utils/types';
import { rewardFractionResolution } from '~/constants/updateConstants.json';
import {
    FormGasRewardFractionField,
    GasRewardFractionField,
    GasRewardFractionFieldProps,
} from './GasRewardFractionField';
import { isDefined } from '~/utils/basicHelpers';
import ErrorMessage from '~/components/Form/ErrorMessage';

export type UpdateGasRewardsFields = GasRewards;

const fieldNames: EqualRecord<UpdateGasRewardsFields> = {
    baker: 'baker',
    finalizationProof: 'finalizationProof',
    accountCreation: 'accountCreation',
    chainUpdate: 'chainUpdate',
};

const labels: { [P in keyof UpdateGasRewardsFields]: string } = {
    baker: 'Baker:',
    finalizationProof: 'Finalization Proof:',
    accountCreation: 'Account Creation:',
    chainUpdate: 'Chain Update:',
};

const validationRules: RegisterOptions = {
    required: 'Value is required',
    min: { value: 0, message: 'Value can not be negative' },
    max: {
        value: rewardFractionResolution,
        message: 'Value can not be above 100',
    },
};

interface GasRewardsFormProps {
    gasRewards: GasRewards;
    disabled?: boolean;
    readOnly?: boolean;
    title: string;
}

export default function GasRewardsForm({
    gasRewards,
    disabled = false,
    readOnly = false,
    title,
}: GasRewardsFormProps): JSX.Element {
    const fields = Object.keys(gasRewards) as Array<keyof GasRewards>;
    const { errors = {} } = useFormContext<GasRewards>() ?? {};

    const firstError = fields.map((f) => errors[f]).filter(isDefined)[0]
        ?.message;

    return (
        <section>
            <h5>{title}</h5>
            {fields.map((f) => {
                const label = labels[f];
                const name = fieldNames[f];
                const value = gasRewards[f];

                const common: Pick<
                    GasRewardFractionFieldProps,
                    'className' | 'label'
                > & { key: string } = {
                    label,
                    className: 'mB10',
                    key: f,
                };

                return disabled || readOnly ? (
                    <GasRewardFractionField
                        {...common}
                        value={value}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                ) : (
                    <FormGasRewardFractionField
                        {...common}
                        name={name}
                        defaultValue={value}
                        rules={validationRules}
                    />
                );
            })}
            {!disabled && <ErrorMessage>{firstError}</ErrorMessage>}
        </section>
    );
}
