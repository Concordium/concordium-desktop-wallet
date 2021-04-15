import React from 'react';

import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import {
    RelativeRateField,
    FormRelativeRateField,
    RelativeRateFieldProps,
} from '../../common/RelativeRateField';
import { validBigInt } from '~/components/Form/util/validation';

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

    const fieldProps: Pick<
        RelativeRateFieldProps,
        'unit' | 'denominator' | 'denominatorUnit'
    > = {
        unit: { position: 'prefix', value: 'µǤ ' },
        denominatorUnit: { position: 'prefix', value: '€ ' },
        denominator: initialValue.denominator.toString(),
    };

    return (
        <>
            <RelativeRateField
                {...fieldProps}
                label="Current micro GTU per euro rate"
                value={initialValue.numerator.toString()}
                disabled
            />
            <FormRelativeRateField
                {...fieldProps}
                name={fieldNames.microGtuPerEuro}
                label="Current micro GTU per euro rate"
                defaultValue={initialValue.numerator.toString()}
                rules={{
                    required: 'Value must be specified',
                    min: { value: 0, message: 'Value cannot be negative' },
                    validate: validBigInt('Value must be a whole number'),
                }}
            />
        </>
    );
}
