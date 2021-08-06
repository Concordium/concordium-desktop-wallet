import { ExchangeRate, BlockSummary } from '@concordium/node-sdk';
import { RelativeRateFieldProps } from '../../common/RelativeRateField';

// eslint-disable-next-line import/prefer-default-export
export const getCurrentValue = (blockSummary: BlockSummary): ExchangeRate =>
    blockSummary.updates.chainParameters.euroPerEnergy;

export const commonFieldProps: Pick<
    RelativeRateFieldProps,
    'numeratorUnit' | 'denominatorUnit'
> = {
    numeratorUnit: { position: 'prefix', value: '€ ' },
    denominatorUnit: { position: 'postfix', value: ' NRG' },
};
