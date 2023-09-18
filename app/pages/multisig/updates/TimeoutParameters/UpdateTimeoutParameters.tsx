import React from 'react';
import { isChainParametersV0, isChainParametersV1 } from '@concordium/web-sdk';
import { Validate } from 'react-hook-form';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import { enterHere, validationRulesForPositiveWord64 } from '../common/util';
import {
    TimeoutParametersFields,
    fieldDisplays,
    getTimeoutParameters,
} from './util';
import ShowTimeoutParameters from './TimeoutParametersShow';
import { FormRelativeRateField } from '../../common/RelativeRateField';
import {
    isPositiveNumber,
    RelativeRateValue,
    validBigIntValues,
} from '../../common/RelativeRateField/util';

const fieldNames: EqualRecord<TimeoutParametersFields> = {
    timeoutBase: 'timeoutBase',
    timeoutIncrease: 'timeoutIncrease',
    timeoutDecrease: 'timeoutDecrease',
};

export const isGreaterThanOne: Validate = (value: RelativeRateValue) =>
    parseInt(value.numerator, 10) > parseInt(value.denominator, 10) ||
    'Value must above 1';
export const isLessThanOne: Validate = (value: RelativeRateValue) =>
    parseInt(value.numerator, 10) < parseInt(value.denominator, 10) ||
    'Value must be below 1';

/**
 * Component for creating an update timeout parameters transaction.
 */
export default function UpdateTimeoutParametersFields({
    defaults,
    chainParameters,
}: UpdateProps): JSX.Element | null {
    if (
        isChainParametersV0(chainParameters) ||
        isChainParametersV1(chainParameters)
    ) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    const current = getTimeoutParameters(chainParameters);

    return (
        <div>
            <ShowTimeoutParameters
                parameters={current}
                title="Current timeout parameters"
            />
            <h3>New timeout parameters</h3>
            <Form.Input
                className="body2 mB10"
                name={fieldNames.timeoutBase}
                defaultValue={
                    defaults.timeoutBase || current.timeoutBase.toString()
                }
                label={`New ${fieldDisplays.timeoutBase} (ms)`}
                placeholder={enterHere(fieldDisplays.timeoutBase)}
                rules={validationRulesForPositiveWord64(
                    fieldDisplays.timeoutBase
                )}
            />
            <FormRelativeRateField
                name={fieldNames.timeoutIncrease}
                label="New timeout increase"
                className="mB10"
                defaultValue={
                    defaults.timeoutIncrease || current.timeoutIncrease
                }
                splitSymbol="/"
                rules={{
                    validate: {
                        isPositiveNumber,
                        validBigIntValues,
                        isGreaterThanOne,
                    },
                }}
            />
            <FormRelativeRateField
                name={fieldNames.timeoutDecrease}
                label="New timeout decrease"
                className="mB10"
                defaultValue={
                    defaults.timeoutDecrease || current.timeoutDecrease
                }
                splitSymbol="/"
                rules={{
                    validate: {
                        isPositiveNumber,
                        validBigIntValues,
                        isLessThanOne,
                    },
                }}
            />
        </div>
    );
}
