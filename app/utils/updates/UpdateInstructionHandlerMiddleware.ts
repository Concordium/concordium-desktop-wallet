import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { Authorizations } from '../NodeApiTypes';
import { UpdateComponent, UpdateInstructionHandler } from '../transactionTypes';
import { UpdateInstruction, UpdateInstructionPayload } from '../types';

export default class UpdateHandlerTypeMiddleware<T>
    implements
        UpdateInstructionHandler<
            UpdateInstruction<UpdateInstructionPayload>,
            ConcordiumLedgerClient
        > {
    base: UpdateInstructionHandler<T, ConcordiumLedgerClient>;

    update: UpdateComponent;

    title: string;

    constructor(base: UpdateInstructionHandler<T, ConcordiumLedgerClient>) {
        this.base = base;
        this.update = base.update;
        this.title = base.title;
    }

    confirmType(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        return transaction;
    }

    serializePayload(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        return this.base.serializePayload(this.base.confirmType(transaction));
    }

    signTransaction(
        transaction: UpdateInstruction<UpdateInstructionPayload>,
        ledger: ConcordiumLedgerClient
    ) {
        return this.base.signTransaction(
            this.base.confirmType(transaction),
            ledger
        );
    }

    view(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        return this.base.view(this.base.confirmType(transaction));
    }

    getAuthorization(authorizations: Authorizations) {
        return this.base.getAuthorization(authorizations);
    }
}
