import { BlockSummary } from '~/node/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
import { getCcdSymbol } from '~/utils/ccd';
import { RelativeRateFieldProps } from '../../common/RelativeRateField';

export const getCurrentValue = (blockSummary: BlockSummary): ExchangeRate =>
    blockSummary.updates.chainParameters.microGTUPerEuro;

export const commonFieldProps: Pick<
    RelativeRateFieldProps,
    'numeratorUnit' | 'denominatorUnit'
> = {
    numeratorUnit: { position: 'prefix', value: `µ${getCcdSymbol()}` },
    denominatorUnit: { position: 'prefix', value: '€' },
};
