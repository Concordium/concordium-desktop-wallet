import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { multiplyFraction } from '../basicHelpers';
import { createConfigureBakerTransaction } from '../transactionHelpers';
import {
    ConfigureBaker,
    ConfigureBakerPayload,
    Fraction,
    NotOptional,
    Account,
} from '../types';

export type RemoveBakerDependencies = NotOptional<ExchangeRate>;

export interface RemoveBakerFlowState {
    confirm: undefined;
}

export type RemoveBakerPayload = NotOptional<
    Pick<ConfigureBakerPayload, 'stake'>
>;

export const removeBakerTitle = 'Remove baker';

export const convertToRemoveBakerTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction
) => (expiry?: Date): ConfigureBaker => {
    const payload: RemoveBakerPayload = {
        stake: BigInt(0),
    };

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
