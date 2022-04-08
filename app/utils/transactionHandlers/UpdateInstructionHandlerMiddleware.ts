import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { Authorizations, BlockSummary } from '~/node/NodeApiTypes';
import {
    TransactionExportType,
    UpdateComponent,
    UpdateInstructionHandler,
} from '~/utils/transactionTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    instanceOfUpdateInstruction,
    Transaction,
} from '~/utils/types';
import { throwLoggedError } from '../basicHelpers';

export default class UpdateInstructionHandlerTypeMiddleware<T>
    implements
        UpdateInstructionHandler<
            UpdateInstruction,
            ConcordiumLedgerClient,
            Transaction
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

    confirmType(transaction: Transaction) {
        if (instanceOfUpdateInstruction(transaction)) {
            return transaction;
        }
        return throwLoggedError('Invalid transaction type was given as input.');
    }

    getFileNameForExport(
        transaction: UpdateInstruction<UpdateInstructionPayload>,
        exportType: TransactionExportType
    ): string {
        return this.base.getFileNameForExport(transaction, exportType);
    }

    createTransaction(
        blockSummary: BlockSummary,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: any,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        return this.base.createTransaction(
            blockSummary,
            fields,
            effectiveTime,
            expiryTime
        );
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

    print(
        transaction: Transaction,
        status: MultiSignatureTransactionStatus,
        identiconImage?: string
    ) {
        return this.base.print(
            this.confirmType(transaction),
            status,
            identiconImage
        );
    }

    view(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        return this.base.view(this.base.confirmType(transaction));
    }

    getAuthorization(authorizations: Authorizations) {
        return this.base.getAuthorization(authorizations);
    }
}
