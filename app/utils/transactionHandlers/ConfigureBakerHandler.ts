import AccountTransactionDetails from '~/components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import {
    AccountTransactionHandler,
    TransactionExportType,
} from '~/utils/transactionTypes';
import {
    AccountTransaction,
    ConfigureBaker,
    instanceOfConfigureBaker,
    TransactionPayload,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';

export default class ConfigureBakerHandler
    implements
        AccountTransactionHandler<ConfigureBaker, ConcordiumLedgerClient> {
    confirmType(transaction: AccountTransaction<TransactionPayload>) {
        if (instanceOfConfigureBaker(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    getFileNameForExport(
        _: ConfigureBaker,
        exportType: TransactionExportType
    ): string {
        return `${this.type
            .toLowerCase()
            .replace(/\s/g, '-')}_${exportType}.json`;
    }

    serializePayload(transaction: ConfigureBaker) {
        return serializeTransferPayload(
            transaction.transactionKind,
            transaction.payload
        );
    }

    creationLocationHandler(): string {
        throw new Error('Unimplemented');
    }

    async signTransaction(
        transaction: ConfigureBaker,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput
    ) {
        return ledger.signTransfer(transaction, getAccountPath(path));
    }

    view(transaction: ConfigureBaker) {
        return AccountTransactionDetails({ transaction });
    }

    createTransaction(): ConfigureBaker {
        throw new Error('Unimplemented');
    }

    print = () => undefined;

    type = 'Configure baker';

    title = `Account transaction | ${this.type}`;
}
