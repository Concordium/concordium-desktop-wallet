import React, { useState, useEffect } from 'react';
import { toMicroUnits } from '~/utils/ccd';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import {
    Account,
    AddressBookEntry,
    AccountTransaction,
    Schedule,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import { ensureNonce } from '~/components/Transfers/withNonce';
import Loading from '~/cross-app-components/Loading';
import SignTransaction from './SignTransaction';

interface Props {
    transactionKind: TransactionKindId;
    account: Account;
    recipient: AddressBookEntry;
    estimatedFee?: Fraction;
    amount: string;
    memo?: string;
    schedule?: Schedule;
    nonce: bigint;
    expiryTime: Date;
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
    recipient,
    amount,
    memo,
    schedule,
    estimatedFee,
    nonce,
    expiryTime,
}: Props) {
    const [transaction, setTransaction] = useState<
        AccountTransaction | undefined
    >();

    useEffect(() => {
        const handler = findAccountTransactionHandler(
            transformToMemoKind(transactionKind, memo)
        );
        const t = handler.createTransaction({
            sender: account.address,
            amount: toMicroUnits(amount),
            recipient: recipient.address,
            signatureAmount: account.signatureThreshold,
            memo,
            expiryTime,
            schedule,
            nonce,
        });
        setTransaction({ ...t, estimatedFee });
    }, [
        setTransaction,
        account,
        amount,
        recipient,
        memo,
        schedule,
        transactionKind,
        estimatedFee,
        nonce,
        expiryTime,
    ]);

    if (!transaction) {
        return null; // TODO: show loading;
    }

    return <SignTransaction transaction={transaction} account={account} />;
}

export default ensureNonce(CreateTransaction, () => (
    <Loading text="Fetching information from the node" />
));
