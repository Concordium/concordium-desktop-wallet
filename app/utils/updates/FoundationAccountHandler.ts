import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import FoundationAccountView from '../../pages/multisig/FoundationAccountView';
import UpdateFoundationAccount from '../../pages/multisig/UpdateFoundationAccount';
import { Authorizations } from '../NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    FoundationAccount,
    isFoundationAccount,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeFoundationAccount } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<FoundationAccount>;

export default class FoundationAccountHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isFoundationAccount(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeFoundationAccount(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signFoundationAccount(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return FoundationAccountView({
            foundationAccount: transaction.payload,
        });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.foundationAccount;
    }

    update = UpdateFoundationAccount;

    title = 'Foundation Transaction | Update Foundation Account';
}
