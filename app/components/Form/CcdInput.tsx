import React from 'react';
import InlineNumber, { InlineNumberProps } from './InlineNumber';

export type CcdInputProps = Omit<
    InlineNumberProps,
    | 'ensureDigits'
    | 'allowFractions'
    | 'allowExponent'
    | 'fallbackOnInvalid'
    | 'trimLeadingZeros'
    | 'customFormatter'
    | 'clearOnFocus'
>;

export default function CcdInput(props: CcdInputProps): JSX.Element {
    return (
        <InlineNumber
            {...props}
            ensureDigits={2}
            allowFractions
            trimLeadingZeros
            clearOnFocus
        />
    );
}
