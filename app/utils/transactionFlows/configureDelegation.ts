import {
    AccountInfo,
    AccountInfoType,
    DelegationTarget,
    DelegationTargetBaker,
    DelegationTargetType,
} from '@concordium/web-sdk';

import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { isDefined, multiplyFraction } from '../basicHelpers';
import { ccdToMicroCcd, microCcdToCcd } from '../ccd';
import { not } from '../functionHelpers';
import { getTransactionKindCost } from '../transactionCosts';
import { createConfigureDelegationTransaction } from '../transactionHelpers';
import { serializeTransferPayload } from '../transactionSerialization';
import {
    Account,
    ConfigureDelegationPayload,
    DeepPartial,
    Fraction,
    MakeRequired,
    NotOptional,
    TransactionKindId,
} from '../types';

export type ConfigureDelegationFlowDependencies = NotOptional<ExchangeRate>;

export interface DelegateSettings {
    /** in CCD */
    amount: string;
    redelegate: boolean;
}

export interface ConfigureDelegationFlowState {
    target?: string | null;
    delegate?: DelegateSettings;
}

export const configureDelegationTitle = 'Configure delegation';

export const getExistingDelegationValues = (
    accountInfo: AccountInfo
): NotOptional<ConfigureDelegationFlowState> | undefined => {
    if (accountInfo.type !== AccountInfoType.Delegator) {
        return undefined;
    }

    const {
        delegationTarget,
        stakedAmount,
        restakeEarnings,
    } = accountInfo.accountDelegation;

    return {
        delegate: {
            amount: microCcdToCcd(stakedAmount.microCcdAmount) ?? '0.00',
            redelegate: restakeEarnings,
        },
        target:
            delegationTarget.delegateType === DelegationTargetType.Baker
                ? delegationTarget.bakerId.toString()
                : null,
    };
};

export type ConfigureDelegationFlowStateChanges = MakeRequired<
    DeepPartial<ConfigureDelegationFlowState>,
    'delegate'
>;

export const getDelegationFlowChanges = (
    existingValues: ConfigureDelegationFlowState,
    newValues: ConfigureDelegationFlowState
): ConfigureDelegationFlowStateChanges => {
    const changes: ConfigureDelegationFlowStateChanges = {
        delegate: {},
    };

    try {
        if (
            existingValues.delegate?.amount === undefined ||
            newValues.delegate?.amount === undefined ||
            ccdToMicroCcd(existingValues.delegate?.amount) !==
                ccdToMicroCcd(newValues.delegate?.amount)
        ) {
            changes.delegate.amount = newValues.delegate?.amount;
        }
    } catch {
        // Nothing...
    }
    if (
        existingValues.delegate?.redelegate !== newValues.delegate?.redelegate
    ) {
        changes.delegate.redelegate = newValues.delegate?.redelegate;
    }

    if (existingValues.target !== newValues.target) {
        changes.target = newValues.target;
    }

    return changes;
};

const toPayload = (
    values: DeepPartial<ConfigureDelegationFlowState>
): ConfigureDelegationPayload => ({
    stake: values?.delegate?.amount
        ? ccdToMicroCcd(values.delegate.amount)
        : undefined,
    restakeEarnings: values?.delegate?.redelegate,
    delegationTarget:
        values.target != null ? BigInt(values.target) : values.target,
});

export function getEstimatedConfigureDelegationFee(
    values: DeepPartial<ConfigureDelegationFlowState>,
    exchangeRate: Fraction,
    signatureThreshold = 1
) {
    const payloadSize = serializeTransferPayload(
        TransactionKindId.Configure_delegation,
        toPayload(values)
    ).length;

    return getTransactionKindCost(
        TransactionKindId.Configure_delegation,
        exchangeRate,
        signatureThreshold,
        undefined,
        payloadSize
    );
}

/**
 * Converts values of flow to a configure delegation transaction.
 *
 * Throws if no changes to existing values have been made.
 */
export const convertToConfigureDelegationTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction,
    accountInfo?: AccountInfo
) => (values: ConfigureDelegationFlowState, expiry?: Date) => {
    const existing =
        accountInfo !== undefined
            ? getExistingDelegationValues(accountInfo)
            : undefined;
    const changes =
        existing !== undefined
            ? getDelegationFlowChanges(existing, values)
            : values;
    const { delegate, ...topLevelChanges } = changes;

    if (
        Object.values({ ...delegate, ...topLevelChanges }).every(not(isDefined))
    ) {
        throw new Error(
            'Trying to submit a transaction without any changes to the existing delegation configuration of an account.'
        );
    }

    const transaction = createConfigureDelegationTransaction(
        account.address,
        toPayload(changes),
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

export const isPassiveDelegation = (
    target: DelegationTarget | string | bigint | null
) =>
    target === null ||
    (target as DelegationTarget)?.delegateType ===
        DelegationTargetType.PassiveDelegation;

export const displayDelegationTarget = (
    target: DelegationTarget | string | bigint | null
) => {
    if (isPassiveDelegation(target)) {
        return 'Passive delegation';
    }

    const id = (target as DelegationTargetBaker).bakerId ?? target;

    return `Validator ID ${id.toString()}`;
};

export const displayRedelegate = (value: boolean) => (value ? 'Yes' : 'No');
