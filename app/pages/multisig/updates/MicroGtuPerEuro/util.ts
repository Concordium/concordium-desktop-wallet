import { ensureBigIntValues } from '~/utils/exchangeRateHelpers';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { toFixed } from '~/utils/numberStringHelpers';
import { ExchangeRate } from '~/utils/types';

export const getCurrentValue = (blockSummary: BlockSummary): ExchangeRate =>
    ensureBigIntValues(blockSummary.updates.chainParameters.microGTUPerEuro);

export const formatDenominator = toFixed(2);
