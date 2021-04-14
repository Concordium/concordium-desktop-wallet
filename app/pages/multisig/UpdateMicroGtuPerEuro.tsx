import React from 'react';

import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import {
    RelativeRateField,
    FormRelativeRateField,
} from './common/RelativeRateField';
import { noOp } from '~/utils/basicHelpers';
import { isValidBigIntValidator } from './common/RelativeRateField/validation';

export interface UpdateMicroGtuPerEuroRateFields {
    microGtuPerEuro: string;
}

const fieldNames: EqualRecord<UpdateMicroGtuPerEuroRateFields> = {
    microGtuPerEuro: 'microGtuPerEuro',
};

export default function UpdateMicroGtuPerEuroRate({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    const initialValue = blockSummary.updates.chainParameters.microGTUPerEuro;

    if (!initialValue) {
        return null;
    }

    return (
        <>
            <RelativeRateField
                label="Current micro GTU per euro rate"
                unit={{ position: 'prefix', value: 'µǤ ' }}
                denominatorUnit={{ position: 'prefix', value: '€ ' }}
                value={initialValue.numerator.toString()}
                denominator={BigInt(initialValue.denominator)}
                onChange={noOp}
                onBlur={noOp}
                disabled
            />
            <FormRelativeRateField
                name={fieldNames.microGtuPerEuro}
                label="Current micro GTU per euro rate"
                unit={{ position: 'prefix', value: 'µǤ ' }}
                denominatorUnit={{ position: 'prefix', value: '€ ' }}
                defaultValue={initialValue.numerator.toString()}
                denominator={BigInt(initialValue.denominator)}
                rules={{
                    required: 'Value must be specified',
                    min: { value: 0, message: 'Value cannot be negative' },
                    validate: isValidBigIntValidator(
                        'Value must be a whole number'
                    ),
                }}
            />
        </>
    );
}
