import { BlockSummary } from './NodeApiTypes';
import {
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
} from './types';

export interface TransactionInput {
    transaction: string;
    type: string;
}

/**
 * The Props interface used by components for handling parameter update
 * transactions.
 */
export interface UpdateProps {
    blockSummary: BlockSummary;
    forwardTransaction: (
        multiSignatureTransaction: Partial<MultiSignatureTransaction>
    ) => Promise<void>;
}

export type UpdateComponent = (props: UpdateProps) => JSX.Element | null;

/**
 * Interface definition for a class that handles a specific type
 * of transaction. The handler can serialize and sign the transaction,
 * and generate a view of the transaction.
 * TODO: Decide whether this handler is only for updateInstruction, or make it support account transactions
 */
export interface TransactionHandler<T, S> {
    confirmType: (
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ) => T;
    serializePayload: (transaction: T) => Buffer;
    signTransaction: (transaction: T, signer: S) => Promise<Buffer>;
    view: (transaction: T) => JSX.Element;
    update: UpdateComponent;
    title: string;
}
