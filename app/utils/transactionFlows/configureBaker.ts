import { ConfigureBakerPayload, NotOptional } from '../types';

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
