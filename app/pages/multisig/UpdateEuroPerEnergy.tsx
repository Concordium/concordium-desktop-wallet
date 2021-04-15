import React from 'react';
import { Validate } from 'react-hook-form';
import { toFraction, toResolution } from '~/utils/numberStringHelpers';
import { UpdateProps } from '~/utils/transactionTypes';
import { EqualRecord } from '~/utils/types';
import {
    RelativeRateField,
    FormRelativeRateField,
    RelativeRateFieldProps,
} from './common/RelativeRateField';
import { ensureBigIntValues } from './util';

export interface UpdateEuroPerEnergyFields {
    euroPerEnergy: string;
}

const fieldNames: EqualRecord<UpdateEuroPerEnergyFields> = {
    euroPerEnergy: 'euroPerEnergy',
};

export default function UpdateEuroPerEnergy({ blockSummary }: UpdateProps) {
    const initialValue = blockSummary.updates.chainParameters.euroPerEnergy;
    if (!initialValue) {
        return null;
    }

    const { denominator, numerator } = ensureBigIntValues(initialValue);
    const errorMessage = `Value must go into 1/${denominator}`;

    const fieldProps: Pick<
        RelativeRateFieldProps,
        'unit' | 'denominator' | 'denominatorUnit'
    > = {
        unit: { position: 'prefix', value: '€ ' },
        denominatorUnit: { position: 'postfix', value: ' NRG' },
        denominator: '1',
    };

    const normalisedNumerator = toFraction(denominator)(numerator);

    const validate: Validate = (value: string) => {
        try {
            toResolution(denominator)(value);
        } catch {
            return errorMessage;
        }

        return true;
    };

    return (
        <>
            <RelativeRateField
                {...fieldProps}
                label="Current euro per energy"
                value={normalisedNumerator}
                disabled
            />
            <FormRelativeRateField
                {...fieldProps}
                name={fieldNames.euroPerEnergy}
                label="New euro per energy"
                defaultValue={normalisedNumerator}
                rules={{
                    required: errorMessage,
                    min: { value: 0, message: 'Value cannot be negative' },
                    validate,
                }}
            />
        </>
    );
}
