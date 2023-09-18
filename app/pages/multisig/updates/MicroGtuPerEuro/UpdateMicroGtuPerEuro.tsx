import React from 'react';

import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import { FormRelativeRateField } from '../../common/RelativeRateField';
import { commonFieldProps } from './util';
import {
    isPositiveNumber,
    validBigIntValues,
    fromExchangeRate,
    RelativeRateValue,
} from '../../common/RelativeRateField/util';
import { getCcdSymbol } from '~/utils/ccd';

export interface UpdateMicroGtuPerEuroRateFields {
    microGtuPerEuroRate: RelativeRateValue;
}

const fieldNames: EqualRecord<UpdateMicroGtuPerEuroRateFields> = {
    microGtuPerEuroRate: 'microGtuPerEuroRate',
};

export default function UpdateMicroGtuPerEuroRate({
    defaults,
    chainParameters,
}: UpdateProps): JSX.Element | null {
    const exchangeRate = chainParameters.microGTUPerEuro;
    const currentValue: RelativeRateValue = fromExchangeRate(exchangeRate);
    const { numeratorUnit, denominatorUnit } = commonFieldProps;

    return (
        <div>
            <div className="body3 mono mB10">
                Current rate: {getCcdSymbol()}
                {denominatorUnit?.value}
                {currentValue.denominator} = {numeratorUnit?.value}
                {currentValue.numerator}
            </div>
            <FormRelativeRateField
                {...commonFieldProps}
                name={fieldNames.microGtuPerEuroRate}
                label="New micro CCD per euro rate"
                defaultValue={defaults.microGtuPerEuroRate || currentValue}
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
