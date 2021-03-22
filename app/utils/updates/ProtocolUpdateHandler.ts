import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import ProtocolUpdateView from '../../pages/multisig/ProtocolUpdateView';
import UpdateProtocol from '../../pages/multisig/UpdateProtocol';
import { Authorizations } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    isProtocolUpdate,
    ProtocolUpdate,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeProtocolUpdate } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<ProtocolUpdate>;

export default class ProtocolUpdateHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isProtocolUpdate(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeProtocolUpdate(transaction.payload).serialization;
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signProtocolUpdate(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return ProtocolUpdateView({ protocolUpdate: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.protocol;
    }

    update = UpdateProtocol;

    title = 'Foundation Transaction | Update Chain Protocol';
}
