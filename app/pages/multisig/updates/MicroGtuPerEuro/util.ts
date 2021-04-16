import { ensureBigIntValues } from '~/utils/exchangeRateHelpers';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { toFixed } from '~/utils/numberStringHelpers';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateFieldProps } from '../../common/RelativeRateField';

export const getCurrentValue = (blockSummary: BlockSummary): ExchangeRate =>
    ensureBigIntValues(blockSummary.updates.chainParameters.microGTUPerEuro);

export const formatDenominator = toFixed(2);

export const commonFieldProps: Pick<
    RelativeRateFieldProps,
    'unit' | 'denominatorUnit'
> = {
    unit: { position: 'prefix', value: 'µǤ ' },
    denominatorUnit: { position: 'prefix', value: '€ ' },
};
