import React from 'react';
import { Validate } from 'react-hook-form';
import Form from '~/components/Form';
import { UpdateProps } from '~/utils/transactionTypes';
import { EqualRecord } from '~/utils/types';
import {
    RelativeRateField,
    FormRelativeRateField,
    RelativeRateFieldProps,
} from '../../common/RelativeRateField';
import { useNormalisation } from '../../common/RelativeRateField/util';
import { getCurrentValue } from './util';

export interface UpdateEuroPerEnergyFields {
    euroPerEnergy: string;
    isNormalised: boolean;
}

const fieldNames: EqualRecord<UpdateEuroPerEnergyFields> = {
    euroPerEnergy: 'euroPerEnergy',
    isNormalised: 'isNormalised',
};

export default function UpdateEuroPerEnergy({ blockSummary }: UpdateProps) {
    const { denominator, numerator } = getCurrentValue(blockSummary);

    const { safeToFraction, safeToResolution, isNormalised } = useNormalisation(
        denominator
    );

    const fieldProps: Pick<
        RelativeRateFieldProps,
        'unit' | 'denominator' | 'denominatorUnit'
    > = {
        unit: { position: 'prefix', value: '€ ' },
        denominatorUnit: { position: 'postfix', value: ' NRG' },
        denominator: isNormalised ? '1' : denominator.toString(),
    };

    const normalisedNumerator = safeToFraction(numerator);

    const isResolutionFraction: Validate = (value: string) => {
        try {
            safeToResolution(value);
            return true;
        } catch {
            return isNormalised
                ? `Value must go into 1/${denominator}`
                : 'Value must be a whole number';
        }
    };
    const notEqual: Validate = (value: string) =>
        value !== normalisedNumerator || "Value hasn't changed";

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
                    required: 'Value is required',
                    min: { value: 0, message: 'Value cannot be negative' },
                    validate: { isResolutionFraction, notEqual },
                }}
            />
            <Form.Checkbox
                name={fieldNames.isNormalised}
                checked={isNormalised}
                readOnly
                style={{ display: 'none' }}
            />
        </>
    );
}
