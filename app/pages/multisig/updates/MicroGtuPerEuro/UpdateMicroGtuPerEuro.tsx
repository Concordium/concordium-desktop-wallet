import React from 'react';

import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import { validBigInt } from '~/components/Form/util/validation';
import {
    RelativeRateField,
    FormRelativeRateField,
    RelativeRateFieldProps,
} from '../../common/RelativeRateField';
import { formatDenominator, getCurrentValue } from './util';

export interface UpdateMicroGtuPerEuroRateFields {
    microGtuPerEuro: string;
}

const fieldNames: EqualRecord<UpdateMicroGtuPerEuroRateFields> = {
    microGtuPerEuro: 'microGtuPerEuro',
};

export default function UpdateMicroGtuPerEuroRate({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    const { denominator, numerator } = getCurrentValue(blockSummary);

    const fieldProps: Pick<
        RelativeRateFieldProps,
        'unit' | 'denominator' | 'denominatorUnit'
    > = {
        unit: { position: 'prefix', value: 'µǤ ' },
        denominatorUnit: { position: 'prefix', value: '€ ' },
        denominator: formatDenominator(denominator.toString()),
    };

    return (
        <>
            <RelativeRateField
                {...fieldProps}
                label="Current micro GTU per euro rate"
                value={numerator.toString()}
                disabled
            />
            <FormRelativeRateField
                {...fieldProps}
                name={fieldNames.microGtuPerEuro}
                label="New micro GTU per euro rate"
                defaultValue={numerator.toString()}
                rules={{
                    required: 'Value must be specified',
                    min: { value: 0, message: 'Value cannot be negative' },
                    validate: validBigInt('Value must be a whole number'), // TODO: validate that value is actually a new value.
                }}
            />
        </>
    );
}
