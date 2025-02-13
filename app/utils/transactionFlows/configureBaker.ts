import type { AccountInfo } from '@concordium/web-sdk';
import {
    ChainParameters,
    ChainParametersV0,
    OpenStatus,
    OpenStatusText,
    AccountInfoType,
    CcdAmount,
} from '@concordium/web-sdk';

import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { isDefined, multiplyFraction } from '../basicHelpers';
import { ccdToMicroCcd, microCcdToCcd } from '../ccd';
import { not } from '../functionHelpers';
import { fractionResolution } from '../rewardFractionHelpers';
import { BakerKeys } from '../rustInterface';
import { getConfigureBakerCost } from '../transactionCosts';
import { createConfigureBakerTransaction } from '../transactionHelpers';
import { serializeTransferPayload } from '../transactionSerialization';
import {
    ConfigureBaker,
    ConfigureBakerPayload,
    Fraction,
    NotOptional,
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

export interface Commissions {
    transactionFeeCommission: number;
    bakingRewardCommission: number;
    finalizationRewardCommission: number;
}

export type MetadataUrl = string;

export interface ConfigureBakerFlowState {
    stake?: StakeSettings;
    openForDelegation?: OpenStatus;
    commissions?: Commissions;
    metadataUrl?: MetadataUrl;
    keys?: BakerKeys;
    suspended?: boolean;
}

export const getDefaultCommissions = (
    cp: Exclude<ChainParameters, ChainParametersV0>
): Commissions => ({
    transactionFeeCommission: cp.transactionCommissionRange.max,
    bakingRewardCommission: cp.bakingCommissionRange.max,
    finalizationRewardCommission: cp.finalizationCommissionRange.max,
});

const decimalToRewardFraction = (d: number | undefined) =>
    d === undefined ? undefined : d * fractionResolution;

const convertCommissionsToRewardFractions = (
    c: Partial<Commissions> | undefined
): Partial<Commissions> | undefined => {
    if (c === undefined) {
        return undefined;
    }

    return {
        bakingRewardCommission: decimalToRewardFraction(
            c.bakingRewardCommission
        ),
        transactionFeeCommission: decimalToRewardFraction(
            c.transactionFeeCommission
        ),
        finalizationRewardCommission: decimalToRewardFraction(
            c.finalizationRewardCommission
        ),
    };
};

export const toConfigureBakerPayload = ({
    keys,
    stake,
    openForDelegation,
    metadataUrl,
    commissions,
    suspended,
}: DeepPartial<Omit<ConfigureBakerFlowState, 'keys'>> &
    Pick<ConfigureBakerFlowState, 'keys'>): ConfigureBakerPayload => ({
    keys:
        keys !== undefined
            ? {
                  electionVerifyKey: keys.electionPublic,
                  proofElection: keys.proofElection,
                  signatureVerifyKey: keys.signaturePublic,
                  proofSig: keys.proofSignature,
                  aggregationVerifyKey: keys.aggregationPublic,
                  proofAggregation: keys.proofAggregation,
              }
            : undefined,
    stake:
        stake?.stake !== undefined ? CcdAmount.fromCcd(stake.stake) : undefined,
    restakeEarnings: stake?.restake,
    openForDelegation,
    metadataUrl,
    suspended,
    ...convertCommissionsToRewardFractions(commissions),
});

const openStatusEnumFromText = (text: OpenStatusText): OpenStatus => {
    switch (text) {
        case OpenStatusText.OpenForAll:
            return OpenStatus.OpenForAll;
        case OpenStatusText.ClosedForNew:
            return OpenStatus.ClosedForNew;
        case OpenStatusText.ClosedForAll:
            return OpenStatus.ClosedForAll;
        default:
            throw new Error(`Case not handled: ${text}`);
    }
};

export const getExistingBakerValues = (
    ai: AccountInfo | undefined
): Omit<ConfigureBakerFlowState, 'keys'> | undefined => {
    if (
        ai === undefined ||
        ai.type !== AccountInfoType.Baker ||
        ai.accountBaker.version === 0
    ) {
        return undefined;
    }
    const { accountBaker } = ai;

    return {
        stake: {
            stake:
                microCcdToCcd(accountBaker.stakedAmount.microCcdAmount) ??
                '1000.00',
            restake: accountBaker.restakeEarnings,
        },
        openForDelegation: openStatusEnumFromText(
            accountBaker.bakerPoolInfo.openStatus
        ),
        metadataUrl: accountBaker.bakerPoolInfo.metadataUrl,
        commissions: {
            transactionFeeCommission:
                accountBaker.bakerPoolInfo?.commissionRates
                    .transactionCommission,
            bakingRewardCommission:
                accountBaker.bakerPoolInfo?.commissionRates.bakingCommission,
            finalizationRewardCommission:
                accountBaker.bakerPoolInfo?.commissionRates
                    .finalizationCommission,
        },
        suspended: accountBaker.isSuspended,
    };
};

const isAccountInfo = (
    dyn: ConfigureBakerFlowState | AccountInfo
): dyn is AccountInfo => (dyn as AccountInfo).accountIndex !== undefined;

export type ConfigureBakerFlowStateChanges = MakeRequired<
    DeepPartial<Omit<ConfigureBakerFlowState, 'keys'>> &
        Pick<ConfigureBakerFlowState, 'keys'>,
    'stake' | 'commissions'
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
    };

    if (
        existingValues.stake?.stake === undefined ||
        newValues.stake?.stake === undefined ||
        ccdToMicroCcd(existingValues.stake?.stake) !==
            ccdToMicroCcd(newValues.stake?.stake)
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

    if (newValues.keys !== undefined) {
        changes.keys = { ...newValues.keys };
    }

    if (newValues.suspended !== existingValues.suspended) {
        changes.suspended = newValues.suspended;
    }

    return changes;
}

/**
 * Converts values of flow to a configure baker transaction.
 *
 * Throws if no changes to existing values have been made.
 */
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
    const changes =
        existing !== undefined ? getBakerFlowChanges(values, existing) : values;
    const { commissions, stake, keys, ...topLevelChanges } = changes;

    if (
        Object.values({
            ...commissions,
            ...stake,
            ...keys,
            ...topLevelChanges,
        }).every(not(isDefined))
    ) {
        throw new Error(
            'Trying to submit a transaction without any changes to the existing validator configuration of an account.'
        );
    }

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
    values: DeepPartial<Omit<ConfigureBakerFlowState, 'keys'>> &
        Pick<ConfigureBakerFlowState, 'keys'>,
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

export const isPoolClosedForAll = (status: OpenStatus | OpenStatusText) => {
    const parsed =
        typeof status === 'number' ? status : openStatusEnumFromText(status);
    return parsed === OpenStatus.ClosedForAll;
};

export const displayPoolOpen = (status: OpenStatus | OpenStatusText) => {
    const parsed =
        typeof status === 'number' ? status : openStatusEnumFromText(status);

    switch (parsed) {
        case OpenStatus.OpenForAll:
            return 'Open for delegation';
        case OpenStatus.ClosedForNew:
            return 'Closed for new delegators';
        case OpenStatus.ClosedForAll:
            return 'Closed for delegation';
        default:
            throw new Error(`Status not supported: ${parsed}`);
    }
};

export const displayRestakeEarnings = (value: boolean) =>
    value ? 'Yes' : 'No';

export const displaySuspension = (suspend: boolean) =>
    suspend ? 'Suspend validation' : 'Resume validation';
