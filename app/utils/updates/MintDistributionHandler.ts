import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import MintDistributionView from '../../pages/multisig/MintDistributionView';
import {
    isMintDistribution,
    MintDistribution,
    TransactionHandler,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeMintDistribution } from '../UpdateSerialization';

export default class MintDistributionHandler
    implements
        TransactionHandler<
            UpdateInstruction<MintDistribution>,
            ConcordiumLedgerClient
        > {
    transaction: UpdateInstruction<MintDistribution>;

    constructor(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        if (isMintDistribution(transaction)) {
            this.transaction = transaction;
        } else {
            throw Error('Invalid transaction type was given as input.');
        }
    }

    serializePayload() {
        return serializeMintDistribution(this.transaction.payload);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signMintDistribution(
            this.transaction,
            this.serializePayload(),
            path
        );
    }

    view() {
        return MintDistributionView({
            mintDistribution: this.transaction.payload,
        });
    }
}
