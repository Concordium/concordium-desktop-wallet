import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { getConfigureBakerKeysCost } from '../transactionCosts';
import { Fraction, NotOptional } from '../types';
import { ConfigureBakerFlowState } from './configureBaker';

export const updateBakerKeysTitle = 'Update validator keys';

export type UpdateBakerKeysDependencies = NotOptional<ExchangeRate>;
export type UpdateBakerKeysFlowState = Pick<ConfigureBakerFlowState, 'keys'>;

export function getEstimatedUpdateBakerKeysFee(
    exchangeRate: Fraction,
    signatureThreshold = 1
) {
    return getConfigureBakerKeysCost(exchangeRate, signatureThreshold);
}
