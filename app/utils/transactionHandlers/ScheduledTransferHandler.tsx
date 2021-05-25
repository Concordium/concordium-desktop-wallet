import React from 'react';
import {
    MultiSignatureTransactionStatus,
    ScheduledTransfer,
    AccountTransaction,
    TransactionPayload,
    instanceOfScheduledTransfer,
    TransactionKindId,
} from '../types';
import routes from '~/constants/routes.json';
import TransferHandler from './TransferHandler';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import PrintFormatScheduledTransfer from '~/components/PrintFormat/ScheduledTransfer';
import { createScheduledTransferTransaction } from '../transactionHelpers';

type TransactionType = ScheduledTransfer;

const TYPE = 'Send GTU with a schedule';

export default class ScheduledTransferHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfScheduledTransfer(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    creationLocationHandler(currentLocation: string) {
        const getNewLocation = () => {
            switch (currentLocation) {
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE:
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
        nonce
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
            signatureAmount
        );
    }

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

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
