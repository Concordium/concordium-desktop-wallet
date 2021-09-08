import React from 'react';
import {
    MultiSignatureTransactionStatus,
    AccountTransaction,
    instanceOfScheduledTransferWithMemo,
    ScheduledTransferWithMemo,
} from '../types';
import TransferHandler from './TransferHandler';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { TYPE, getFileNameForExport } from './ScheduledTransferHandler';
import { createScheduledTransferWithMemoTransaction } from '../transactionHelpers';
import PrintFormatScheduledTransfer from '~/components/PrintFormat/ScheduledTransfer';

type TransactionType = ScheduledTransferWithMemo;

export default class ScheduledTransferWithMemoHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfScheduledTransferWithMemo);
    }

    createTransaction({
        sender,
        schedule,
        recipient,
        signatureAmount,
        nonce,
        expiryTime,
        memo,
    }: Partial<CreateTransactionInput>) {
        if (!sender || !recipient || !schedule || !nonce || !memo) {
            throw new Error(
                `Unexpected Missing input: ${sender}, ${schedule}, ${recipient}, ${nonce}, ${memo}`
            );
        }
        return createScheduledTransferWithMemoTransaction(
            sender,
            recipient,
            schedule,
            nonce,
            memo,
            signatureAmount,
            expiryTime
        );
    }

    getFileNameForExport = getFileNameForExport;

    print(
        transaction: AccountTransaction,
        status: MultiSignatureTransactionStatus,
        identiconImage?: string
    ) {
        const transfer = this.confirmType(transaction);
        return (
            <PrintFormatScheduledTransfer
                transaction={transfer}
                status={status}
                image={identiconImage}
                memo={transfer.payload.memo}
            />
        );
    }
}
