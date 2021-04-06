import React, { useMemo } from 'react';

import { EqualRecord, ExchangeRate } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import {
    RelativeRateField,
    FormRelativeRateField,
} from './common/RelativeRateField';
import { noOp } from '~/utils/basicHelpers';

export interface UpdateMicroGtuPerEuroRateFields {
    microGtuPerEuro: ExchangeRate;
}

const fieldNames: EqualRecord<UpdateMicroGtuPerEuroRateFields> = {
    microGtuPerEuro: 'microGtuPerEuro',
};

export default function UpdateMicroGtuPerEuroRate({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    const initialValue: ExchangeRate = useMemo(
        () => ({
            numerator:
                blockSummary.updates.chainParameters.microGTUPerEuro.numerator,
            denominator:
                blockSummary.updates.chainParameters.microGTUPerEuro
                    .denominator,
        }),
        [blockSummary]
    );

    if (!initialValue) {
        return null;
    }

    return (
        <>
            <RelativeRateField
                label="Current micro GTU per euro rate"
                unit="µǤ"
                denominatorUnit="€"
                value={initialValue}
                onChange={noOp}
                onBlur={noOp}
                disabled
            />
            <FormRelativeRateField
                name={fieldNames.microGtuPerEuro}
                label="Current micro GTU per euro rate"
                unit="µǤ"
                denominatorUnit="€"
                defaultValue={initialValue}
                rules={{
                    required: 'Value must be specified',
                }}
            />
        </>
    );
}
