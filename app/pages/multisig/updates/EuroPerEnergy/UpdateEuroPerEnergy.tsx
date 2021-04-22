import React from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import { EqualRecord } from '~/utils/types';
import {
    RelativeRateField,
    FormRelativeRateField,
} from '../../common/RelativeRateField';
import {
    isPositiveNumber,
    validBigIntValues,
    fromExchangeRate,
    RelativeRateValue,
} from '../../common/RelativeRateField/util';
import { commonFieldProps, getCurrentValue } from './util';

export interface UpdateEuroPerEnergyFields {
    euroPerEnergyRate: RelativeRateValue;
}

const fieldNames: EqualRecord<UpdateEuroPerEnergyFields> = {
    euroPerEnergyRate: 'euroPerEnergyRate',
};

export default function UpdateEuroPerEnergy({ blockSummary }: UpdateProps) {
    const exchangeRate = getCurrentValue(blockSummary);
    const currentValue: RelativeRateValue = fromExchangeRate(exchangeRate);

    return (
        <>
            <RelativeRateField
                {...commonFieldProps}
                label="Current euro per energy"
                value={currentValue}
                disabled
            />
            <FormRelativeRateField
                {...commonFieldProps}
                name={fieldNames.euroPerEnergyRate}
                label="New euro per energy"
                defaultValue={currentValue}
                rules={{
                    validate: {
                        isPositiveNumber,
                        validBigIntValues,
                    },
                }}
            />
        </>
    );
}
