import React from 'react';
import {
    MultiSignatureTransactionStatus,
    SimpleTransfer,
    AccountTransaction,
    TransactionPayload,
    instanceOfSimpleTransfer,
    TransactionKindId,
} from '../types';
import routes from '~/constants/routes.json';
import TransferHandler from './TransferHandler';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { createSimpleTransferTransaction } from '../transactionHelpers';
import PrintFormatSimpleTransfer from '~/components/PrintFormat/SimpleTransfer';

type TransactionType = SimpleTransfer;

const TYPE = 'Send GTU';

export default class SimpleTransferHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfSimpleTransfer(transaction)) {
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
    }: Partial<CreateTransactionInput>) {
        if (!sender || !recipient || amount === undefined) {
            throw new Error(
                `Unexpected Missing input: ${{ sender, amount, recipient }}`
            );
        }
        return createSimpleTransferTransaction(
            sender,
            amount,
            recipient,
            signatureAmount
        );
    }

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

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
