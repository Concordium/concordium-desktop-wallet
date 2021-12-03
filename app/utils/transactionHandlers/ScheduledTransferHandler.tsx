import React from 'react';
import {
    MultiSignatureTransactionStatus,
    ScheduledTransfer,
    AccountTransaction,
    instanceOfScheduledTransfer,
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
import PrintFormatScheduledTransfer from '~/components/PrintFormat/ScheduledTransfer';
import {
    createScheduledTransferTransaction,
    getScheduledTransferAmount,
} from '../transactionHelpers';

type TransactionType = ScheduledTransfer;

export const TYPE = 'Send CCD with a schedule';

export function getFileNameForExport(
    transaction: ScheduledTransfer,
    exportType: TransactionExportType
) {
    const sender = transaction.sender.substring(0, 6);
    const receiver = transaction.payload.toAddress.substring(0, 6);
    const amount = getScheduledTransferAmount(transaction);

    return `${transaction.nonce.padStart(
        3,
        '0'
    )}-scheduled-transfer-${amount}_${sender}-to-${receiver}_${exportType}.json`;
}

export default class ScheduledTransferHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfScheduledTransfer);
    }

    creationLocationHandler(currentLocation: string) {
        const getNewLocation = () => {
            switch (currentLocation) {
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;
                default:
                    throw new Error('unknown location');
            }
        };
        return getNewLocation().replace(
            ':transactionKind',
            `${TransactionKindId.Transfer_with_schedule}`
        );
    }

    createTransaction({
        sender,
        schedule,
        recipient,
        signatureAmount,
        nonce,
        expiryTime,
    }: Partial<CreateTransactionInput>) {
        if (!sender || !recipient || !schedule || !nonce) {
            throw new Error(
                `Unexpected Missing input: ${sender}, ${schedule}, ${recipient}, ${nonce}`
            );
        }
        return createScheduledTransferTransaction(
            sender,
            recipient,
            schedule,
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
            <PrintFormatScheduledTransfer
                transaction={this.confirmType(transaction)}
                status={status}
                image={identiconImage}
            />
        );
    }
}
