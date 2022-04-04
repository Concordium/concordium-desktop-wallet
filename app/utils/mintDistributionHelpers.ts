import { getNumberParts } from './numberStringHelpers';
import { MintRate } from './types';

export const parseMintRate = (mintRate: string): MintRate | undefined => {
    const { whole, fractions = '', exponent: e = '0' } = getNumberParts(
        mintRate
    );

    const mantissa = parseInt(`${whole + fractions}`, 10);
    const exponent = parseInt(e.replace('-', ''), 10) + fractions.length;

    if (Number.isNaN(mantissa) || Number.isNaN(exponent)) {
        return undefined;
    }

    return { mantissa, exponent };
};

export const stringifyMintRate = (mintRate: MintRate): string => {
    return `${mintRate.mantissa}e-${mintRate.exponent}`;
};
