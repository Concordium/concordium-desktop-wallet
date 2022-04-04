import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { multiplyFraction } from '../basicHelpers';
import { createConfigureDelegationTransaction } from '../transactionHelpers';
import {
    ConfigureDelegation,
    Fraction,
    NotOptional,
    ConfigureDelegationPayload,
    Account,
} from '../types';

export type RemoveDelegationDependencies = NotOptional<ExchangeRate>;
export type RemoveDelegationPayload = Pick<ConfigureDelegationPayload, 'stake'>;

export interface RemoveDelegationFlowState {
    confirm: undefined;
}

export const removeDelegationTitle = 'Remove delegation';

export const convertToRemoveDelegationTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction
) => (expiry?: Date): ConfigureDelegation => {
    const payload: RemoveDelegationPayload = {
        stake: BigInt(0),
    };

    const transaction = createConfigureDelegationTransaction(
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
