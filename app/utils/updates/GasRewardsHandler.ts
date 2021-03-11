import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import GasRewardsView from '../../pages/multisig/GasRewardsView';
import UpdateGasRewards from '../../pages/multisig/UpdateGasRewards';
import { Authorizations } from '../NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    GasRewards,
    isGasRewards,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeGasRewards } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<GasRewards>;

export default class GasRewardsHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isGasRewards(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeGasRewards(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signGasRewards(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return GasRewardsView({ gasRewards: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.paramGASRewards;
    }

    update = UpdateGasRewards;

    title = 'Foundation Transaction | Update Gas Rewards';
}
