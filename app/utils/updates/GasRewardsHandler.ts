import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import GasRewardsView from '../../pages/multisig/GasRewardsView';
import {
    GasRewards,
    isGasRewards,
    TransactionHandler,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeGasRewards } from '../UpdateSerialization';

export default class GasRewardsHandler
    implements
        TransactionHandler<
            UpdateInstruction<GasRewards>,
            ConcordiumLedgerClient
        > {
    transaction: UpdateInstruction<GasRewards>;

    constructor(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        if (isGasRewards(transaction)) {
            this.transaction = transaction;
        } else {
            throw Error('Invalid transaction type was given as input.');
        }
    }

    serializePayload() {
        return serializeGasRewards(this.transaction.payload);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signGasRewards(
            this.transaction,
            this.serializePayload(),
            path
        );
    }

    view() {
        return GasRewardsView({
            gasRewards: this.transaction.payload,
        });
    }
}
