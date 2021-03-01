import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import TransactionFeeDistributionView from '../../pages/multisig/TransactionFeeDistributionView';
import UpdateTransactionFeeDistribution from '../../pages/multisig/UpdateTransactionFeeDistribution';
import { Authorizations } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    isTransactionFeeDistribution,
    TransactionFeeDistribution,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeTransactionFeeDistribution } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<TransactionFeeDistribution>;

export default class TransactionFeeDistributionHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isTransactionFeeDistribution(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeTransactionFeeDistribution(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signTransactionFeeDistribution(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return TransactionFeeDistributionView({
            transactionFeeDistribution: transaction.payload,
        });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.transactionFeeDistribution;
    }

    update = UpdateTransactionFeeDistribution;

    title = 'Foundation Transaction | Update Transaction Fee Distribution';
}
