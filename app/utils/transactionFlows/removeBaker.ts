import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { AccountAndNonce } from '~/components/Transfers/withNonce';
import { multiplyFraction } from '../basicHelpers';
import { createConfigureBakerTransaction } from '../transactionHelpers';
import {
    ConfigureBaker,
    ConfigureBakerPayload,
    Fraction,
    NotOptional,
    Account,
} from '../types';

export type Dependencies = NotOptional<ExchangeRate & AccountAndNonce>;

export interface RemoveBakerFlowState {
    confirm: undefined;
}

export type RemoveBakerPayload = NotOptional<
    Pick<ConfigureBakerPayload, 'stake'>
>;

export const title = 'Remove baker';

export const convertToTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction
) => (): ConfigureBaker => {
    const payload: RemoveBakerPayload = {
        stake: BigInt(0),
    };

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
