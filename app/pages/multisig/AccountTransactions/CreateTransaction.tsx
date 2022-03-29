import React, { useMemo } from 'react';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import {
    Account,
    AccountTransaction,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import { CreateTransactionInput } from '~/utils/transactionTypes';
import { ensureNonce } from '~/components/Transfers/withNonce';
import Loading from '~/cross-app-components/Loading';
import SignTransaction from './SignTransaction';

interface Props extends Partial<CreateTransactionInput> {
    transactionKind: TransactionKindId;
    account: Account;
    estimatedFee?: Fraction;
}

function transformToMemoKind(
    transactionKind: TransactionKindId,
    memo?: string
): TransactionKindId {
    if (memo) {
        switch (transactionKind) {
            case TransactionKindId.Simple_transfer:
            case TransactionKindId.Simple_transfer_with_memo:
                return TransactionKindId.Simple_transfer_with_memo;
            case TransactionKindId.Transfer_with_schedule:
            case TransactionKindId.Transfer_with_schedule_and_memo:
                return TransactionKindId.Transfer_with_schedule_and_memo;
            case TransactionKindId.Encrypted_transfer:
            case TransactionKindId.Encrypted_transfer_with_memo:
                return TransactionKindId.Encrypted_transfer_with_memo;
            default:
                throw new Error('unexpected transactionkind with memo');
        }
    } else {
        return transactionKind;
    }
}

function CreateTransaction({
    transactionKind,
    account,
    estimatedFee,
    ...createTransactionInput
}: Props) {
    const transaction: AccountTransaction = useMemo(() => {
        const handler = findAccountTransactionHandler(
            transformToMemoKind(transactionKind, createTransactionInput.memo)
        );
        const t = handler.createTransaction({
            ...createTransactionInput,
            sender: account.address,
            signatureAmount: account.signatureThreshold,
        });
        return { ...t, estimatedFee };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <SignTransaction transaction={transaction} account={account} />;
}

export default ensureNonce(CreateTransaction, () => (
    <Loading text="Fetching information from the node" />
));
