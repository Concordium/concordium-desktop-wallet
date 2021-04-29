import React from 'react';
import { RegisterOptions, useFormContext, Validate } from 'react-hook-form';
import { EqualRecord, GasRewards } from '~/utils/types';
import { rewardFractionResolution } from '~/constants/updateConstants.json';
import {
    FormGasRewardFractionField,
    GasRewardFractionField,
    GasRewardFractionFieldProps,
    gasRewardFractionFieldResolution,
} from './GasRewardFractionField';
import { isDefined } from '~/utils/basicHelpers';
import ErrorMessage from '~/components/Form/ErrorMessage';
import { isValidBigInt } from '~/utils/numberStringHelpers';

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

const convertsToInteger: Validate = (v: number) =>
    isValidBigInt(v) ||
    `Value be divisible by ${1 / gasRewardFractionFieldResolution}`;

const validationRules: RegisterOptions = {
    required: 'Value is required',
    min: { value: 0, message: 'Value can not be negative' },
    max: {
        value: rewardFractionResolution,
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
    title: string;
}

export default function GasRewardsForm({
    gasRewards,
    disabled = false,
    readOnly = false,
    title,
}: GasRewardsFormProps): JSX.Element {
    const fields = Object.keys(fieldNames) as Array<keyof GasRewards>;
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
                    GasRewardFractionFieldProps,
                    'className' | 'label'
                > & { key: string } = {
                    label,
                    className: 'mB10',
                    key: field,
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
