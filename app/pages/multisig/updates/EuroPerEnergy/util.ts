import { BlockSummary } from '~/node/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
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
