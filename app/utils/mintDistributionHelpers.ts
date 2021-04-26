import { getNumberParts } from './numberStringHelpers';
import { MintRate } from './types';

// eslint-disable-next-line import/prefer-default-export
export const parseMintPerSlot = (mintPerSlot: string): MintRate | undefined => {
    const { whole, fractions = '', exponent = '0' } = getNumberParts(
        mintPerSlot
    );

    return {
        mantissa: parseInt(whole, 10),
        exponent: parseInt(exponent.replace('-', ''), 10) + fractions.length,
    };
};
