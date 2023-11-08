import React from 'react';
import { RegisterOptions, useFormContext, Validate } from 'react-hook-form';
import {
    EqualRecord,
    GasRewards,
    GasRewardsV0,
    GasRewardsV1,
} from '~/utils/types';
import updateConstants from '~/constants/updateConstants.json';
import {
    FormRewardFractionField,
    RewardFractionField,
    RewardFractionFieldProps,
    rewardFractionFieldResolution,
} from '../common/RewardFractionField';
import { isDefined } from '~/utils/basicHelpers';
import ErrorMessage from '~/components/Form/ErrorMessage';
import { isValidBigInt } from '~/utils/numberStringHelpers';

export type UpdateGasRewardsFieldsV0 = Omit<GasRewardsV0, 'version'>;
export type UpdateGasRewardsFieldsV1 = Omit<GasRewardsV1, 'version'>;

const fieldNamesV1: EqualRecord<UpdateGasRewardsFieldsV1> = {
    baker: 'baker',
    accountCreation: 'accountCreation',
    chainUpdate: 'chainUpdate',
};

const fieldNamesV0: EqualRecord<UpdateGasRewardsFieldsV0> = {
    finalizationProof: 'finalizationProof',
    ...fieldNamesV1,
};

const labels: { [P in keyof UpdateGasRewardsFieldsV0]: string } = {
    finalizationProof: 'Finalization proof:',
    baker: 'Baker:',
    accountCreation: 'Account creation:',
    chainUpdate: 'Chain update:',
};

const convertsToInteger: Validate = (v: number) =>
    isValidBigInt(v) ||
    `Value must be divisible by ${1 / rewardFractionFieldResolution}`;

const validationRules: RegisterOptions = {
    required: 'Value is required',
    min: { value: 0, message: 'Value can not be negative' },
    max: {
        value: updateConstants.rewardFractionResolution,
        message: 'Value can not be above 100',
    },
    validate: {
        convertsToInteger,
    },
};

interface GasRewardsFormProps {
    gasRewards: GasRewards;
    disabled?: boolean;
    readOnly?: boolean;
    display?: boolean;
    title: string;
}

export default function GasRewardsForm({
    gasRewards,
    disabled = false,
    display = false,
    readOnly = display,
    title,
}: GasRewardsFormProps): JSX.Element {
    const fields = (gasRewards.version === 0
        ? Object.keys(fieldNamesV0)
        : Object.keys(fieldNamesV1)) as Array<
        keyof Omit<GasRewards, 'version'>
    >;
    const { errors = {} } = useFormContext<GasRewards>() ?? {};

    const firstError = fields.map((f) => errors[f]).filter(isDefined)[0]
        ?.message;

    return (
        <section>
            <h5>{title}</h5>
            {fields.map((field) => {
                const label = labels[field];
                const value = gasRewards[field];

                const common: Pick<
                    RewardFractionFieldProps,
                    'className' | 'label'
                > & { key: string } = {
                    label: label || '',
                    className: 'mB10',
                    key: field,
                };

                return disabled || readOnly ? (
                    <RewardFractionField
                        {...common}
                        value={value}
                        disabled={disabled}
                        readOnly={readOnly}
                        display={display}
                    />
                ) : (
                    <FormRewardFractionField
                        {...common}
                        name={field}
                        defaultValue={value}
                        rules={validationRules}
                    />
                );
            })}
            {!disabled && <ErrorMessage>{firstError}</ErrorMessage>}
        </section>
    );
}
