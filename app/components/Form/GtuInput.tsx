import React from 'react';
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
        />
    );
}
