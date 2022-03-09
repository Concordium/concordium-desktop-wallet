import { AccountInfo } from '@concordium/node-sdk';
import { isDelegatorAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import { DelegationTargetType } from '@concordium/node-sdk/lib/src/types';
import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { multiplyFraction } from '../basicHelpers';
import { microGtuToGtu, toMicroUnits } from '../gtu';
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
    if (!isDelegatorAccount(accountInfo)) {
        return undefined;
    }

    const {
        delegationTarget,
        stakedAmount,
        restakeEarnings,
    } = accountInfo.accountDelegation;

    return {
        delegate: {
            amount: microGtuToGtu(stakedAmount) ?? '0.00',
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
            toMicroUnits(existingValues.delegate?.amount) !==
                toMicroUnits(newValues.delegate?.amount)
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
        ? toMicroUnits(values.delegate.amount)
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

export const displayDelegationTarget = (target: string | bigint | null) =>
    target === null ? 'L-pool' : target.toString();

export const displayRedelegate = (value: boolean) =>
    value ? 'Redelegate' : "Don't redelegate";
