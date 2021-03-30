import BakerStakeThresholdView from '~/pages/multisig/BakerStakeThresholdView';
import UpdateBakerStakeThreshold from '~/pages/multisig/UpdateBakerStakeThreshold';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { Authorizations } from '../NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    isBakerStakeThreshold,
    BakerStakeThreshold,
} from '../types';
import { serializeBakerStakeThreshold } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<BakerStakeThreshold>;

export default class EuroPerEnergyHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isBakerStakeThreshold(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeBakerStakeThreshold(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signBakerStakeThreshold(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return BakerStakeThresholdView({
            bakerStakeThreshold: transaction.payload,
        });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.bakerStakeThreshold;
    }

    update = UpdateBakerStakeThreshold;

    title = 'Foundation Transaction | Update baker stake threshold';
}
