/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountInfo, ChainParameters } from '@concordium/node-sdk';
import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { isDefined, multiplyFraction } from '../basicHelpers';
import { microGtuToGtu, toMicroUnits } from '../gtu';
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
    MakeRequired,
} from '../types';
import { ChainData } from '../withChainData';

export type ConfigureBakerFlowDependencies = NotOptional<
    ChainData & ExchangeRate
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
export const getDefaultCommissions = (
    chainParameters: ChainParameters
): Commissions => ({
    transactionFeeCommission:
        (chainParameters as any)?.transactionCommissionRange?.max ?? 15000, // TODO remove defaults.
    bakingRewardCommission:
        (chainParameters as any)?.bakingCommissionRange?.max ?? 75000,
    finalizationRewardCommission:
        (chainParameters as any)?.finalizationCommissionRange?.max ?? 100000,
});

export const toConfigureBakerPayload = ({
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
    metadataUrl,
    ...commissions,
});

export const getExistingBakerValues = (
    { accountBaker }: AccountInfo = {} as AccountInfo
): Omit<ConfigureBakerFlowState, 'keys'> | undefined => {
    if (accountBaker === undefined) {
        return undefined;
    }

    return {
        stake: {
            stake: microGtuToGtu(accountBaker.stakedAmount) ?? '1000.00',
            restake: accountBaker.restakeEarnings,
        },
        // TODO get proper existing values
        openForDelegation: (accountBaker as any).bakerPoolInfo?.openStatus,
        metadataUrl: (accountBaker as any).bakerPoolInfo?.metadataUrl,
        commissions: {
            transactionFeeCommission: (accountBaker as any).bakerPoolInfo
                ?.commissionRates.transactionFeeCommission,
            bakingRewardCommission: (accountBaker as any).bakerPoolInfo
                ?.commissionRates.bakingRewardCommission,
            finalizationRewardCommission: (accountBaker as any).bakerPoolInfo
                ?.commissionRates.finalizationRewardCommission,
        },
    };
};

const isAccountInfo = (
    dyn: ConfigureBakerFlowState | AccountInfo
): dyn is AccountInfo => (dyn as AccountInfo).accountIndex !== undefined;

export type ConfigureBakerFlowStateChanges = MakeRequired<
    DeepPartial<ConfigureBakerFlowState>,
    'stake' | 'commissions' | 'keys'
>;

export function getBakerFlowChanges(
    newValues: ConfigureBakerFlowState,
    existingValues: ConfigureBakerFlowState
): ConfigureBakerFlowStateChanges;
export function getBakerFlowChanges(
    newValues: ConfigureBakerFlowState,
    accountInfo: AccountInfo | undefined
): ConfigureBakerFlowStateChanges | undefined;
export function getBakerFlowChanges(
    newValues: ConfigureBakerFlowState,
    dyn: (AccountInfo | undefined) | ConfigureBakerFlowState
): ConfigureBakerFlowStateChanges | undefined {
    let existingValues: ConfigureBakerFlowState;

    if (!isDefined(dyn)) {
        return undefined;
    }

    if (isAccountInfo(dyn)) {
        existingValues = getExistingBakerValues(dyn) ?? {};
    } else {
        existingValues = dyn;
    }

    const changes: ConfigureBakerFlowStateChanges = {
        stake: {},
        commissions: {},
        keys: {},
    };

    if (
        existingValues.stake?.stake === undefined ||
        newValues.stake?.stake === undefined ||
        toMicroUnits(existingValues.stake?.stake) !==
            toMicroUnits(newValues.stake?.stake)
    ) {
        changes.stake.stake = newValues.stake?.stake;
    }
    if (existingValues.stake?.restake !== newValues.stake?.restake) {
        changes.stake.restake = newValues.stake?.restake;
    }

    if (existingValues.openForDelegation !== newValues.openForDelegation) {
        changes.openForDelegation = newValues.openForDelegation;
    }

    if (
        existingValues.commissions?.transactionFeeCommission !==
        newValues.commissions?.transactionFeeCommission
    ) {
        changes.commissions.transactionFeeCommission =
            newValues.commissions?.transactionFeeCommission;
    }
    if (
        existingValues.commissions?.bakingRewardCommission !==
        newValues.commissions?.bakingRewardCommission
    ) {
        changes.commissions.bakingRewardCommission =
            newValues.commissions?.bakingRewardCommission;
    }
    if (
        existingValues.commissions?.finalizationRewardCommission !==
        newValues.commissions?.finalizationRewardCommission
    ) {
        changes.commissions.finalizationRewardCommission =
            newValues.commissions?.finalizationRewardCommission;
    }

    if (existingValues.metadataUrl !== newValues.metadataUrl) {
        changes.metadataUrl = newValues.metadataUrl;
    }

    changes.keys = { ...newValues.keys };

    return changes;
}

export const convertToBakerTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction,
    accountInfo?: AccountInfo
) => (values: ConfigureBakerFlowState, expiry?: Date): ConfigureBaker => {
    const existing =
        accountInfo !== undefined
            ? getExistingBakerValues(accountInfo)
            : undefined;
    const payload = toConfigureBakerPayload(
        existing !== undefined ? getBakerFlowChanges(values, existing) : values
    );

    const transaction = createConfigureBakerTransaction(
        account.address,
        payload,
        nonce,
        account.signatureThreshold,
        expiry
    );
    transaction.estimatedFee = multiplyFraction(
        exchangeRate,
        transaction.energyAmount
    );

    return transaction;
};

export function getEstimatedConfigureBakerFee(
    values: DeepPartial<ConfigureBakerFlowState>,
    exchangeRate: Fraction,
    signatureThreshold = 1
) {
    const payloadSize = serializeTransferPayload(
        TransactionKindId.Configure_baker,
        toConfigureBakerPayload(values)
    ).length;

    return getConfigureBakerCost(
        exchangeRate,
        payloadSize,
        values.keys !== undefined,
        signatureThreshold
    );
}

export const displayPoolOpen = (status: OpenStatus) => {
    switch (status) {
        case OpenStatus.OpenForAll:
            return 'Open for delegation';
        case OpenStatus.ClosedForNew:
            return 'Closed for new delegators';
        case OpenStatus.ClosedForAll:
            return 'Closed for delegation';
        default:
            throw new Error(`Status not supported: ${status}`);
    }
};

export const displayRestakeEarnings = (value: boolean) =>
    value ? 'Yes' : 'No';
