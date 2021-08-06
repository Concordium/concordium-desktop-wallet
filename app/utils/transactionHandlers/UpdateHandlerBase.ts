import { Authorization, Authorizations } from '@concordium/node-sdk';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
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
        throw Error('Invalid transaction type was given as input.');
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
        throw new Error(
            'If this method was invoked, then it happened due to an implementation error.'
        );
    }

    print() {
        return undefined;
    }

    title = `Foundation Transaction | ${this.type}`;
}
