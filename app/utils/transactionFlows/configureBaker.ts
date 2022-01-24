import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { AccountAndNonce } from '~/components/Transfers/withNonce';
import { ConfigureBakerPayload, NotOptional } from '../types';
import { ChainData } from '../withChainData';

export type Dependencies = NotOptional<
    ChainData & ExchangeRate & AccountAndNonce
>;

export interface StakeSettings {
    stake: string;
    restake: boolean;
}
export type Commissions = NotOptional<
    Pick<
        ConfigureBakerPayload,
        | 'transactionFeeCommission'
        | 'bakingRewardCommission'
        | 'finalizationRewardCommission'
    >
>;

export type MetadataUrl = string;

// TODO: default values should be upper bound from chain.
export const getDefaultCommissions = (): Commissions => ({
    transactionFeeCommission: 15000,
    bakingRewardCommission: 15000,
    finalizationRewardCommission: 15000,
});
