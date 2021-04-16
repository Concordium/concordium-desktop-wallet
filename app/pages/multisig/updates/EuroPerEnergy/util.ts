import { ensureBigIntValues } from '~/utils/exchangeRateHelpers';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateFieldProps } from '../../common/RelativeRateField';

// eslint-disable-next-line import/prefer-default-export
export const getCurrentValue = (blockSummary: BlockSummary): ExchangeRate =>
    ensureBigIntValues(blockSummary.updates.chainParameters.euroPerEnergy);

export const getCommonFieldProps = (
    isNormalised: boolean
): Pick<
    RelativeRateFieldProps,
    'unit' | 'denominatorUnit' | 'allowFractions' | 'ensureDigits'
> => ({
    unit: { position: 'prefix', value: '€ ' },
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    allowFractions: isNormalised,
    ensureDigits: isNormalised ? 2 : undefined,
});
