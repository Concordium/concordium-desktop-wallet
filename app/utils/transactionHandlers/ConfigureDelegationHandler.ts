import AccountTransactionDetails from '~/components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import {
    AccountTransactionHandler,
    TransactionExportType,
} from '~/utils/transactionTypes';
import {
    AccountTransaction,
    ConfigureDelegation,
    instanceOfConfigureDelegation,
    TransactionPayload,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';

export default class ConfigureDelegationHandler
    implements
        AccountTransactionHandler<ConfigureDelegation, ConcordiumLedgerClient> {
    confirmType(transaction: AccountTransaction<TransactionPayload>) {
        if (instanceOfConfigureDelegation(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    getFileNameForExport(
        _: ConfigureDelegation,
        exportType: TransactionExportType
    ): string {
        return `${this.type
            .toLowerCase()
            .replace(/\s/g, '-')}_${exportType}.json`;
    }

    serializePayload(transaction: ConfigureDelegation) {
        return serializeTransferPayload(
            transaction.transactionKind,
            transaction.payload
        );
    }

    creationLocationHandler(): string {
        throw new Error('Unimplemented');
    }

    async signTransaction(
        transaction: ConfigureDelegation,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput
    ) {
        return ledger.signTransfer(transaction, getAccountPath(path));
    }

    view(transaction: ConfigureDelegation) {
        return AccountTransactionDetails({ transaction });
    }

    createTransaction(): ConfigureDelegation {
        throw new Error('Unimplemented');
    }

    print = () => undefined;

    type = 'Configure delegation';

    title = `Account transaction | ${this.type}`;
}
