import React from 'react';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import {
    RegisterOptions,
    useFormContext,
    Validate,
    FieldError,
} from 'react-hook-form';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form';
import { FormCommissionRangeField } from './CommissionRangeField';
import { onlyDigitsNoLeadingZeroes, isDefined } from '~/utils/basicHelpers';
import {
    FormRewardFractionField as FractionFieldForm,
    rewardFractionFieldResolution,
} from '../common/RewardFractionField/RewardFractionField';
import updateConstants from '~/constants/updateConstants.json';
import { FormRelativeRateField } from '../../common/RelativeRateField';
import {
    fieldDisplays,
    convertRewardFractions,
    UpdatePoolParametersFields,
} from './util';
import { isValidBigInt } from '~/utils/numberStringHelpers';
import ErrorMessage from '~/components/Form/ErrorMessage';

import PoolParametersShow from './PoolParametersShow';

export const fieldNames: EqualRecord<UpdatePoolParametersFields> = {
    finalizationCommissionLPool: 'finalizationCommissionLPool',
    bakingCommissionLPool: 'bakingCommissionLPool',
    transactionCommissionLPool: 'transactionCommissionLPool',
    finalizationCommissionRange: 'finalizationCommissionRange',
    bakingCommissionRange: 'bakingCommissionRange',
    transactionCommissionRange: 'transactionCommissionRange',
    minimumEquityCapital: 'minimumEquityCapital',
    capitalBound: 'capitalBound',
    leverageBound: 'leverageBound',
};

const convertsToInteger: (n: string) => Validate = (name: string) => (
    v: number
) =>
    isValidBigInt(v) ||
    `${name} must be divisible by ${1 / rewardFractionFieldResolution}`;

function validationRules(name: string): RegisterOptions {
    return {
        required: `${name} is required`,
        min: { value: 0, message: `${name} can not be negative` },
        max: {
            value: updateConstants.rewardFractionResolution,
            message: `${name} can not be above 100`,
        },
        validate: convertsToInteger(name),
    };
}

function rangeValidationRules(name: string): RegisterOptions {
    return {
        required: `${name} is required`,
        validate: {
            convertsToInteger: (v) =>
                convertsToInteger(`${name} minimum`)(v.min) ||
                convertsToInteger(`${name} maximum`)(v.max),
            minNeg: (v) => v.min >= 0 || `${name} minimum can not be negative`,
            maxNeg: (v) => v.max >= 0 || `${name} maximum can not be negative`,
            minCeil: (v) =>
                v.min >= 100 || `${name} minimum can not be above 100`,
            maxCeil: (v) =>
                v.max >= 100 || `${name} maximum can not be above 100`,
            order: (v) =>
                v.max >= v.min ||
                `${name} maximum can not be lower than minimum`,
        },
    };
}

/**
 * Component for creating an update pool parameters transaction.
 */
export default function UpdatePoolParameters({
    defaults,
    blockSummary,
}: UpdateProps): JSX.Element | null {
    if (!isBlockSummaryV1(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const poolParameters = convertRewardFractions(
        blockSummary.updates.chainParameters
    );
    const {
        finalizationCommissionLPool,
        bakingCommissionLPool,
        transactionCommissionLPool,
        finalizationCommissionRange,
        bakingCommissionRange,
        transactionCommissionRange,
        minimumEquityCapital,
        capitalBound,
        leverageBound,
    } = poolParameters;

    const { errors = {} } = useFormContext<UpdatePoolParametersFields>() ?? {};

    const fields = Object.keys(fieldNames).filter(
        (key) =>
            ![
                fieldNames.minimumEquityCapital,
                fieldNames.leverageBound,
                '',
            ].includes(key)
    ) as Array<keyof UpdatePoolParametersFields>;
    const firstError = (fields
        .map((f) => errors[f])
        .filter(isDefined)[0] as FieldError)?.message;

    return (
        <>
            <PoolParametersShow
                poolParameters={poolParameters}
                title="Current pool parameters"
            />
            <h5>New pool parameters</h5>
            <div>
                <FractionFieldForm
                    label={fieldDisplays.transactionCommissionLPool}
                    name={fieldNames.transactionCommissionLPool}
                    defaultValue={
                        defaults.transactionCommissionLPool ||
                        transactionCommissionLPool.toString()
                    }
                    rules={validationRules(
                        fieldDisplays.transactionCommissionLPool
                    )}
                />
                <FractionFieldForm
                    label={fieldDisplays.bakingCommissionLPool}
                    name={fieldNames.bakingCommissionLPool}
                    defaultValue={
                        defaults.bakingCommissionLPool ||
                        bakingCommissionLPool.toString()
                    }
                    rules={validationRules(fieldDisplays.bakingCommissionLPool)}
                />
                <FractionFieldForm
                    label={fieldDisplays.finalizationCommissionLPool}
                    name={fieldNames.finalizationCommissionLPool}
                    defaultValue={
                        defaults.finalizationCommissionLPool ||
                        finalizationCommissionLPool.toString()
                    }
                    rules={validationRules(
                        fieldDisplays.finalizationCommissionLPool
                    )}
                />
                <FormCommissionRangeField
                    name={fieldNames.transactionCommissionRange}
                    label={fieldDisplays.transactionCommissionRange}
                    defaultValue={
                        defaults.transactionCommissionRange ||
                        transactionCommissionRange
                    }
                    rules={rangeValidationRules(
                        fieldDisplays.transactionCommissionRange
                    )}
                />
                <FormCommissionRangeField
                    name={fieldNames.bakingCommissionRange}
                    label={fieldDisplays.bakingCommissionRange}
                    defaultValue={
                        defaults.bakingCommissionRange || bakingCommissionRange
                    }
                    rules={rangeValidationRules(
                        fieldDisplays.bakingCommissionRange
                    )}
                />
                <FormCommissionRangeField
                    name={fieldNames.finalizationCommissionRange}
                    label={fieldDisplays.finalizationCommissionRange}
                    defaultValue={
                        defaults.transactionCommissionRange ||
                        finalizationCommissionRange
                    }
                    rules={rangeValidationRules(
                        fieldDisplays.finalizationCommissionRange
                    )}
                />
                <FractionFieldForm
                    label={fieldDisplays.capitalBound}
                    name={fieldNames.capitalBound}
                    defaultValue={
                        defaults.capitalBound || capitalBound.toString()
                    }
                />
                <ErrorMessage>{firstError}</ErrorMessage>
                <FormRelativeRateField
                    name={fieldNames.leverageBound}
                    label={fieldDisplays.leverageBound}
                    defaultValue={
                        defaults.leverageBound || {
                            numerator: leverageBound.numerator.toString(),
                            denominator: leverageBound.denominator.toString(),
                        }
                    }
                    numeratorUnit={{
                        value: ' max delegator stake',
                        position: 'postfix',
                    }}
                    denominatorUnit={{
                        value: ' equity capital',
                        position: 'postfix',
                    }}
                    className="mB20"
                    rules={{
                        required: `${fieldDisplays.leverageBound} is required`,
                        validate: {
                            numbers: (v) =>
                                (onlyDigitsNoLeadingZeroes(v.numerator) &&
                                    onlyDigitsNoLeadingZeroes(v.denominator)) ||
                                'Both parts must be a valid number',
                            max: (v) =>
                                (v.numerator < 18446744073709551615n &&
                                    v.denominator < 18446744073709551615n) ||
                                'Each part must be below 18446744073709551615',
                        },
                    }}
                />
                <Form.Input
                    className="body2"
                    name={fieldNames.minimumEquityCapital}
                    label={fieldDisplays.minimumEquityCapital}
                    defaultValue={
                        defaults.minimumEquityCapital ||
                        minimumEquityCapital.toString()
                    }
                    rules={{
                        required: 'Threshold is required',
                        min: { value: 0, message: 'Must be above 0' },
                        max: {
                            value: '18446744073709551615',
                            message: 'Must be below 18446744073709551615',
                        },
                        validate: (v) =>
                            onlyDigitsNoLeadingZeroes(v) ||
                            'Must be a valid number',
                    }}
                />
            </div>
        </>
    );
}
