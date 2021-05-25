import React from 'react';
import { microGTUPerGTU } from '~/utils/gtu';
import { getPowerOf10 } from '~/utils/numberStringHelpers';
import InlineNumber, { InlineNumberProps } from './InlineNumber';

export type GtuInputProps = Omit<
    InlineNumberProps,
    | 'ensureDigits'
    | 'allowFractions'
    | 'allowExponent'
    | 'fallbackOnInvalid'
    | 'trimLeadingZeros'
    | 'customFormatter'
    | 'step'
    | 'min'
>;

export default function GtuInput(props: GtuInputProps): JSX.Element {
    return (
        <InlineNumber
            {...props}
            ensureDigits={2}
            allowFractions
            trimLeadingZeros
            min={0}
            step={`0.${'0'.repeat(getPowerOf10(microGTUPerGTU) - 1)}1`}
        />
    );
}
