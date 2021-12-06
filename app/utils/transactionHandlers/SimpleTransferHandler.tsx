import React from 'react';
import {
    MultiSignatureTransactionStatus,
    SimpleTransfer,
    AccountTransaction,
    instanceOfSimpleTransfer,
    TransactionKindId,
} from '../types';
import routes from '~/constants/routes.json';
import TransferHandler from './TransferHandler';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
    TransactionExportType,
} from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { createSimpleTransferTransaction } from '../transactionHelpers';
import PrintFormatSimpleTransfer from '~/components/PrintFormat/SimpleTransfer';

type TransactionType = SimpleTransfer;

export const TYPE = 'Send CCD';

export function getFileNameForExport(
    transaction: TransactionType,
    exportType: TransactionExportType
) {
    const sender = transaction.sender.substring(0, 6);
    const receiver = transaction.payload.toAddress.substring(0, 6);
    const { amount } = transaction.payload;

    return `transfer-${amount}_${sender}-to-${receiver}_${exportType}.json`;
}

export default class SimpleTransferHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfSimpleTransfer);
    }

    creationLocationHandler(currentLocation: string) {
        const getNewLocation = () => {
            switch (currentLocation) {
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;
                default:
                    throw new Error('unknown location');
            }
        };
        return getNewLocation().replace(
            ':transactionKind',
            `${TransactionKindId.Simple_transfer}`
        );
    }

    createTransaction({
        sender,
        amount,
        recipient,
        signatureAmount,
        nonce,
        expiryTime,
    }: Partial<CreateTransactionInput>) {
        if (!sender || !recipient || amount === undefined || !nonce) {
            throw new Error(
                `Unexpected Missing input: ${sender}, ${amount}, ${recipient}, ${nonce}`
            );
        }
        return createSimpleTransferTransaction(
            sender,
            amount,
            recipient,
            nonce,
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
        return (
            <PrintFormatSimpleTransfer
                transaction={this.confirmType(transaction)}
                status={status}
                image={identiconImage}
            />
        );
    }
}
