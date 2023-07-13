import { getCcdSymbol } from '~/utils/ccd';
import { RelativeRateFieldProps } from '../../common/RelativeRateField';

// eslint-disable-next-line import/prefer-default-export
export const commonFieldProps: Pick<
    RelativeRateFieldProps,
    'numeratorUnit' | 'denominatorUnit'
> = {
    numeratorUnit: { position: 'prefix', value: `µ${getCcdSymbol()}` },
    denominatorUnit: { position: 'prefix', value: '€' },
};
