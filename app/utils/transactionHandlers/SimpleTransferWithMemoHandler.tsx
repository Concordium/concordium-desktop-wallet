import React from 'react';
import {
    MultiSignatureTransactionStatus,
    instanceOfSimpleTransferWithMemo,
    SimpleTransferWithMemo,
    AccountTransaction,
} from '../types';
import TransferHandler from './TransferHandler';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { TYPE, getFileNameForExport } from './SimpleTransferHandler';
import { createSimpleTransferWithMemoTransaction } from '../transactionHelpers';
import PrintFormatSimpleTransfer from '~/components/PrintFormat/SimpleTransfer';

type TransactionType = SimpleTransferWithMemo;

export default class SimpleTransferWithMemoHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfSimpleTransferWithMemo);
    }

    createTransaction({
        sender,
        amount,
        recipient,
        signatureAmount,
        memo,
        nonce,
        expiryTime,
    }: Partial<CreateTransactionInput>) {
        if (!sender || !recipient || amount === undefined || !nonce || !memo) {
            throw new Error(
                `Unexpected Missing input: ${sender}, ${amount}, ${recipient}, ${nonce}, ${memo}`
            );
        }
        return createSimpleTransferWithMemoTransaction(
            sender,
            amount,
            recipient,
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
            <PrintFormatSimpleTransfer
                transaction={transfer}
                status={status}
                image={identiconImage}
                memo={transfer.payload.memo}
            />
        );
    }
}
