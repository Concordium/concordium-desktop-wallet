import { CcdAmount } from '@concordium/web-sdk';

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

export const removeBakerTitle = 'Remove validator';

export const convertToRemoveBakerTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction
) => (expiry?: Date): ConfigureBaker => {
    const payload: RemoveBakerPayload = {
        stake: CcdAmount.zero(),
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
