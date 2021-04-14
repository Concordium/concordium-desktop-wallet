import React from 'react';
import { noOp } from '~/utils/basicHelpers';
import { UpdateProps } from '~/utils/transactionTypes';
import { EqualRecord } from '~/utils/types';
import {
    RelativeRateField,
    FormRelativeRateField,
} from './common/RelativeRateField';
import { isValidBigIntValidator } from './common/RelativeRateField/validation';

export interface UpdateEuroPerEnergyFields {
    euroPerEnergy: string;
}

const fieldNames: EqualRecord<UpdateEuroPerEnergyFields> = {
    euroPerEnergy: 'euroPerEnergy',
};

export default function UpdateEuroPerEnergy({ blockSummary }: UpdateProps) {
    const initialValue = blockSummary.updates.chainParameters.euroPerEnergy;

    return (
        <>
            <RelativeRateField
                label="Current euro per energy"
                unit={{ position: 'prefix', value: '€ ' }}
                denominatorUnit={{ position: 'postfix', value: ' NRG' }}
                value={initialValue.numerator.toString()}
                denominator={initialValue.denominator}
                normalise
                onChange={noOp}
                onBlur={noOp}
                disabled
            />
            <FormRelativeRateField
                name={fieldNames.euroPerEnergy}
                label="New euro per energy"
                unit={{ position: 'prefix', value: '€ ' }}
                denominatorUnit={{ position: 'postfix', value: ' NRG' }}
                defaultValue={initialValue.numerator.toString()}
                denominator={initialValue.denominator}
                normalise
                rules={{
                    required: 'Value must be specified',
                    min: { value: 0, message: 'Value cannot be negative' },
                    validate: isValidBigIntValidator(
                        `Value must go into ${
                            1 / Number(initialValue.denominator)
                        }`
                    ),
                }}
            />
        </>
    );
}
