import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import TransactionFeeDistributionView from '../../pages/multisig/TransactionFeeDistributionView';
import {
    isTransactionFeeDistribution,
    TransactionFeeDistribution,
    TransactionHandler,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeTransactionFeeDistribution } from '../UpdateSerialization';

export default class TransactionFeeDistributionHandler
    implements
        TransactionHandler<
            UpdateInstruction<TransactionFeeDistribution>,
            ConcordiumLedgerClient
        > {
    transaction: UpdateInstruction<TransactionFeeDistribution>;

    constructor(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        if (isTransactionFeeDistribution(transaction)) {
            this.transaction = transaction;
        } else {
            throw Error('Invalid transaction type was given as input.');
        }
    }

    serializePayload() {
        return serializeTransactionFeeDistribution(this.transaction.payload);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signTransactionFeeDistribution(
            this.transaction,
            this.serializePayload(),
            path
        );
    }

    view() {
        return TransactionFeeDistributionView({
            transactionFeeDistribution: this.transaction.payload,
        });
    }
}
