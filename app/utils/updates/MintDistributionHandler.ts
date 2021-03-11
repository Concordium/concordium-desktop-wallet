import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import MintDistributionView from '../../pages/multisig/MintDistributionView';
import UpdateMintDistribution from '../../pages/multisig/UpdateMintDistribution';
import { Authorizations } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    isMintDistribution,
    MintDistribution,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeMintDistribution } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<MintDistribution>;

export default class MintDistributionHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isMintDistribution(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeMintDistribution(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signMintDistribution(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return MintDistributionView({ mintDistribution: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.mintDistribution;
    }

    update = UpdateMintDistribution;

    title = 'Foundation Transaction | Update Mint Distribution';
}
