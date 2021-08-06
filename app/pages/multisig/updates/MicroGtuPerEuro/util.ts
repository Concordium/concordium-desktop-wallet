import { BlockSummary, ExchangeRate } from '@concordium/node-sdk';
import { RelativeRateFieldProps } from '../../common/RelativeRateField';

export const getCurrentValue = (blockSummary: BlockSummary): ExchangeRate =>
    blockSummary.updates.chainParameters.microGTUPerEuro;

export const commonFieldProps: Pick<
    RelativeRateFieldProps,
    'numeratorUnit' | 'denominatorUnit'
> = {
    numeratorUnit: { position: 'prefix', value: 'µǤ ' },
    denominatorUnit: { position: 'prefix', value: '€ ' },
};
