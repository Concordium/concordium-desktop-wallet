import * as React from 'react';
import AccountTransactionDetails from '~/components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import { AccountTransactionHandler } from '~/utils/transactionTypes';
import {
    AccountTransaction,
    TransactionPayload,
    instanceOfRemoveBaker,
    RemoveBaker,
    MultiSignatureTransactionStatus,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';
import PrintFormatRemoveBaker from '~/components/PrintFormat/RemoveBaker';

type TransactionType = RemoveBaker;

const TYPE = 'Remove Baker';

export default class RemoveBakerHandler
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfRemoveBaker(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeTransferPayload(
            transaction.transactionKind,
            transaction.payload
        );
    }

    creationLocationHandler(): string {
        throw new Error('Unimplemented');
    }

    async signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput
    ) {
        return ledger.signTransfer(transaction, getAccountPath(path));
    }

    view(transaction: TransactionType) {
        return AccountTransactionDetails({ transaction });
    }

    createTransaction(): Promise<RemoveBaker> {
        throw new Error('Unimplemented');
    }

    print(
        transaction: AccountTransaction,
        status: MultiSignatureTransactionStatus,
        identiconImage?: string
    ) {
        return (
            <PrintFormatRemoveBaker
                transaction={this.confirmType(transaction)}
                status={status}
                image={identiconImage}
            />
        );
    }

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
