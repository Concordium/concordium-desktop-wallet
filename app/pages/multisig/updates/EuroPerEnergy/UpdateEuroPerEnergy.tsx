import React from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import { EqualRecord } from '~/utils/types';
import { FormRelativeRateField } from '../../common/RelativeRateField';
import {
    isPositiveNumber,
    validBigIntValues,
    fromExchangeRate,
    RelativeRateValue,
} from '../../common/RelativeRateField/util';
import { commonFieldProps } from './util';

export interface UpdateEuroPerEnergyFields {
    euroPerEnergyRate: RelativeRateValue;
}

const fieldNames: EqualRecord<UpdateEuroPerEnergyFields> = {
    euroPerEnergyRate: 'euroPerEnergyRate',
};

export default function UpdateEuroPerEnergy({
    defaults,
    chainParameters,
}: UpdateProps) {
    const exchangeRate = chainParameters.euroPerEnergy;
    const currentValue: RelativeRateValue = fromExchangeRate(exchangeRate);
    const { numeratorUnit, denominatorUnit } = commonFieldProps;

    return (
        <div>
            <div className="body3 mono mB10">
                Current rate: {currentValue.denominator}{' '}
                {denominatorUnit?.value} = {numeratorUnit?.value}
                {currentValue.numerator}
            </div>
            <FormRelativeRateField
                {...commonFieldProps}
                name={fieldNames.euroPerEnergyRate}
                label="New euro per energy rate"
                defaultValue={defaults.euroPerEnergyRate || currentValue}
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
