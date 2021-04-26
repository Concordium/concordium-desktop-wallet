import { getNumberParts } from './numberStringHelpers';
import { MintRate } from './types';

// eslint-disable-next-line import/prefer-default-export
export const parseMintPerSlot = (mintPerSlot: string): MintRate | undefined => {
    const { whole, fractions = '', exponent: e = '0' } = getNumberParts(
        mintPerSlot
    );

    const mantissa = parseInt(`${whole + fractions}`, 10);
    const exponent = parseInt(e.replace('-', ''), 10) + fractions.length;

    if (Number.isNaN(mantissa) || Number.isNaN(exponent)) {
        return undefined;
    }

    return { mantissa, exponent };
};
