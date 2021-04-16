import React from 'react';
import { Validate } from 'react-hook-form';
import Form from '~/components/Form';
import { valueNoOp } from '~/utils/basicHelpers';
import { ensureBigIntValues } from '~/utils/exchangeRateHelpers';
import { toFraction, toResolution } from '~/utils/numberStringHelpers';
import { UpdateProps } from '~/utils/transactionTypes';
import { EqualRecord } from '~/utils/types';
import {
    RelativeRateField,
    FormRelativeRateField,
    RelativeRateFieldProps,
} from './common/RelativeRateField';

export interface UpdateEuroPerEnergyFields {
    euroPerEnergy: string;
    isNormalised: boolean;
}

const fieldNames: EqualRecord<UpdateEuroPerEnergyFields> = {
    euroPerEnergy: 'euroPerEnergy',
    isNormalised: 'isNormalised',
};

interface GetConverters {
    safeToFraction(value?: string | bigint | undefined): string | undefined;
    safeToResolution(value?: string | undefined): bigint | undefined;
    isNormalised: boolean;
}

const getConverters = (denominator: bigint): GetConverters => {
    try {
        return {
            safeToFraction: toFraction(denominator),
            safeToResolution: toResolution(denominator),
            isNormalised: true,
        };
    } catch {
        return {
            safeToFraction: valueNoOp,
            safeToResolution: BigInt,
            isNormalised: false,
        };
    }
};

export default function UpdateEuroPerEnergy({ blockSummary }: UpdateProps) {
    const { denominator, numerator } = ensureBigIntValues(
        blockSummary.updates.chainParameters.euroPerEnergy
    );

    const { safeToFraction, safeToResolution, isNormalised } = getConverters(
        denominator
    );

    const errorMessage = isNormalised
        ? `Value must go into 1/${denominator}`
        : 'Value must be a whole number';

    const fieldProps: Pick<
        RelativeRateFieldProps,
        'unit' | 'denominator' | 'denominatorUnit'
    > = {
        unit: { position: 'prefix', value: '€ ' },
        denominatorUnit: { position: 'postfix', value: ' NRG' },
        denominator: '1',
    };

    const normalisedNumerator = safeToFraction(numerator);

    const isResolutionFraction: Validate = (value: string) => {
        try {
            safeToResolution(value);
            return true;
        } catch {
            return errorMessage;
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
                    required: errorMessage,
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
