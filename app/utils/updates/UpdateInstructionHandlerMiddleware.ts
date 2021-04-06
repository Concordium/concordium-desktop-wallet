import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { Authorizations, BlockSummary } from '~/utils/NodeApiTypes';
import {
    UpdateComponent,
    UpdateInstructionHandler,
} from '~/utils/transactionTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    MultiSignatureTransaction,
} from '~/utils/types';

export default class UpdateHandlerTypeMiddleware<T>
    implements
        UpdateInstructionHandler<
            UpdateInstruction<UpdateInstructionPayload>,
            ConcordiumLedgerClient
        > {
    base: UpdateInstructionHandler<T, ConcordiumLedgerClient>;

    update: UpdateComponent;

    title: string;

    type: string;

    constructor(base: UpdateInstructionHandler<T, ConcordiumLedgerClient>) {
        this.base = base;
        this.update = base.update;
        this.title = base.title;
        this.type = base.type;
    }

    confirmType(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        return transaction;
    }

    createTransaction(
        blockSummary: BlockSummary,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: any,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        return this.base.createTransaction(blockSummary, fields, effectiveTime);
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
