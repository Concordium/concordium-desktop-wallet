import { ensureBigIntValues } from '~/utils/exchangeRateHelpers';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';

// eslint-disable-next-line import/prefer-default-export
export const getCurrentValue = (blockSummary: BlockSummary): ExchangeRate =>
    ensureBigIntValues(blockSummary.updates.chainParameters.euroPerEnergy);
