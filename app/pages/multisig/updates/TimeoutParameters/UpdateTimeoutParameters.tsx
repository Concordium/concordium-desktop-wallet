import React from 'react';
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
import { assertChainParametersV2OrHigher } from '~/utils/blockSummaryHelpers';

const fieldNames: EqualRecord<TimeoutParametersFields> = {
    timeoutBase: 'timeoutBase',
    timeoutIncrease: 'timeoutIncrease',
    timeoutDecrease: 'timeoutDecrease',
};

export const isGreaterThanOne: Validate = (value: RelativeRateValue) =>
    BigInt(value.numerator) > BigInt(value.denominator) || 'Value must be above 1';
export const isLessThanOne: Validate = (value: RelativeRateValue) =>
    BigInt(value.numerator) < BigInt(value.denominator) ||
    'Value must be below 1';

/**
 * Component for creating an update timeout parameters transaction.
 */
export default function UpdateTimeoutParametersFields({
    defaults,
    chainParameters,
}: UpdateProps): JSX.Element | null {
    assertChainParametersV2OrHigher(chainParameters);

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
