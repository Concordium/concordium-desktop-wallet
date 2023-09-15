import React from 'react';
import { isChainParametersV0, isChainParametersV1 } from '@concordium/web-sdk';
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
    validBigIntValues,
} from '../../common/RelativeRateField/util';

const fieldNames: EqualRecord<TimeoutParametersFields> = {
    timeoutBase: 'timeoutBase',
    timeoutIncrease: 'timeoutIncrease',
    timeoutDecrease: 'timeoutDecrease',
};

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

    // TODO The timeout increase ratio must be greater than 1. The timeout decrease must be between 0 and 1.

    return (
        <div>
            <ShowTimeoutParameters
                parameters={current}
                title="Current timeout parameters"
            />
            <h3>New timeout parameters</h3>
            <Form.Input
                className="body2"
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
                defaultValue={
                    defaults.timeoutIncrease || current.timeoutIncrease
                }
                rules={{
                    validate: {
                        isPositiveNumber,
                        validBigIntValues,
                    },
                }}
            />
            <FormRelativeRateField
                name={fieldNames.timeoutDecrease}
                label="New timeout decrease"
                defaultValue={
                    defaults.timeoutDecrease || current.timeoutDecrease
                }
                rules={{
                    validate: {
                        isPositiveNumber,
                        validBigIntValues,
                    },
                }}
            />
        </div>
    );
}
