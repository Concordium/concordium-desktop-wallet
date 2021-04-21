import { MintRate } from './types';

// eslint-disable-next-line import/prefer-default-export
export const parseMintPerSlot = (mintPerSlot: string): MintRate | undefined => {
    const [m, e = '0'] = mintPerSlot.toLowerCase().split('e-');
    const [, fractions = ''] = m.split('.');

    return {
        mantissa: parseInt(m.replace('.', ''), 10),
        exponent: parseInt(e, 10) + fractions.length,
    };
};
