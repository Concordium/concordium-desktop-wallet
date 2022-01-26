import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { AccountAndNonce } from '~/components/Transfers/withNonce';
import { multiplyFraction } from '../basicHelpers';
import { toMicroUnits } from '../gtu';
import { BakerKeys } from '../rustInterface';
import { getConfigureBakerCost } from '../transactionCosts';
import { createConfigureBakerTransaction } from '../transactionHelpers';
import { serializeTransferPayload } from '../transactionSerialization';
import {
    ConfigureBaker,
    ConfigureBakerPayload,
    Fraction,
    NotOptional,
    OpenStatus,
    TransactionKindId,
    Account,
    DeepPartial,
} from '../types';
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

export interface ConfigureBakerFlowState {
    stake?: StakeSettings;
    openForDelegation?: OpenStatus;
    commissions?: Commissions;
    metadataUrl?: MetadataUrl;
    keys?: BakerKeys;
}

// TODO: default values should be upper bound from chain.
export const getDefaultCommissions = (): Commissions => ({
    transactionFeeCommission: 15000,
    bakingRewardCommission: 15000,
    finalizationRewardCommission: 15000,
});

export const toPayload = ({
    keys,
    stake,
    openForDelegation,
    metadataUrl,
    commissions,
}: DeepPartial<ConfigureBakerFlowState>): ConfigureBakerPayload => ({
    electionVerifyKey:
        keys?.electionPublic !== undefined && keys?.proofElection !== undefined
            ? [keys.electionPublic, keys.proofElection]
            : undefined,
    signatureVerifyKey:
        keys?.signaturePublic !== undefined &&
        keys?.proofSignature !== undefined
            ? [keys.signaturePublic, keys.proofSignature]
            : undefined,
    aggregationVerifyKey:
        keys?.aggregationPublic !== undefined &&
        keys?.proofAggregation !== undefined
            ? [keys.aggregationPublic, keys.proofAggregation]
            : undefined,
    stake: stake?.stake !== undefined ? toMicroUnits(stake.stake) : undefined,
    restakeEarnings: stake?.restake,
    openForDelegation,
    metadataUrl:
        metadataUrl !== undefined && metadataUrl !== ''
            ? metadataUrl
            : undefined,
    ...commissions,
});

export const convertToTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction
) => (values: ConfigureBakerFlowState): ConfigureBaker => {
    const payload = toPayload(values);

    const transaction = createConfigureBakerTransaction(
        account.address,
        payload,
        nonce
    );
    transaction.estimatedFee = multiplyFraction(
        exchangeRate,
        transaction.energyAmount
    );

    return transaction;
};

export const getChanges = <T extends Partial<ConfigureBakerFlowState>>(
    existingValues: T,
    newValues: T
): DeepPartial<T> => {
    const changesDraft: DeepPartial<T> = { ...(newValues as DeepPartial<T>) };

    if (changesDraft.stake !== undefined) {
        if (existingValues.stake?.stake === newValues.stake?.stake) {
            delete changesDraft.stake.stake;
        }
        if (existingValues.stake?.restake === newValues.stake?.restake) {
            delete changesDraft.stake.restake;
        }
    }

    if (existingValues.openForDelegation === newValues.openForDelegation) {
        delete changesDraft.openForDelegation;
    }

    if (changesDraft.commissions !== undefined) {
        if (
            existingValues.commissions?.transactionFeeCommission ===
            newValues.commissions?.transactionFeeCommission
        ) {
            delete changesDraft.commissions.transactionFeeCommission;
        }
        if (
            existingValues.commissions?.bakingRewardCommission ===
            newValues.commissions?.bakingRewardCommission
        ) {
            delete changesDraft.commissions.bakingRewardCommission;
        }
        if (
            existingValues.commissions?.finalizationRewardCommission ===
            newValues.commissions?.finalizationRewardCommission
        ) {
            delete changesDraft.commissions.finalizationRewardCommission;
        }
    }

    if (existingValues.metadataUrl === newValues.metadataUrl) {
        delete changesDraft.openForDelegation;
    }

    return changesDraft;
};
// Object.entries(newValues)
//     .filter(([k, v]) => v !== existingValues[k as keyof T])
//     .reduce((a, [k, v]) => ({ ...a, [k]: v }), {});

export function getEstimatedFee(
    values: DeepPartial<ConfigureBakerFlowState>,
    exchangeRate: Fraction,
    signatureThreshold = 1
) {
    const payloadSize = serializeTransferPayload(
        TransactionKindId.Configure_baker,
        toPayload(values)
    ).length;

    return getConfigureBakerCost(
        exchangeRate,
        payloadSize,
        values.keys !== undefined,
        signatureThreshold
    );
}
