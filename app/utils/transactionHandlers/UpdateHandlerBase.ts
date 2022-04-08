import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { Authorization, Authorizations } from '~/node/NodeApiTypes';
import { throwLoggedError } from '../basicHelpers';
import {
    TransactionExportType,
    UpdateInstructionHandler,
} from '../transactionTypes';
import { UpdateInstruction, UpdateInstructionPayload } from '../types';

export default class UpdateHandlerBase<
    TransactionType extends UpdateInstruction
> implements
        Pick<
            UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient>,
            | 'getFileNameForExport'
            | 'confirmType'
            | 'type'
            | 'title'
            | 'print'
            | 'getAuthorization'
        > {
    constructor(
        public type: string,
        private instanceOf: (
            obj: UpdateInstruction<UpdateInstructionPayload>
        ) => obj is TransactionType
    ) {}

    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (this.instanceOf(transaction)) {
            return transaction;
        }
        return throwLoggedError('Invalid transaction type was given as input.');
    }

    getFileNameForExport(
        _: TransactionType,
        exportType: TransactionExportType
    ): string {
        return `${this.type
            .toLowerCase()
            .replace(/\s/g, '-')}_${exportType}.json`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAuthorization(_: Authorizations): Authorization {
        return throwLoggedError(
            'If this method was invoked, then it happened due to an implementation error.'
        );
    }

    print() {
        return undefined;
    }

    title = `Foundation transaction | ${this.type}`;
}
