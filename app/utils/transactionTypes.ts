import { Authorization, Authorizations, BlockSummary } from './NodeApiTypes';
import {
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    AddressBookEntry,
    Word8,
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
}

/**
 * The interface contains the location state used by components
 *  for handling the flows to create transfers.
 */
export interface TransferState {
    amount: string;
    transaction: string;
    recipient: AddressBookEntry;
    initialPage: string;
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
    createTransaction: (
        blockSummary: BlockSummary,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: any,
        effectiveTime: bigint
    ) => Promise<Partial<MultiSignatureTransaction> | undefined>;
    serializePayload: (transaction: T) => Buffer;
    signTransaction: (transaction: T, signer: S) => Promise<Buffer>;
    view: (transaction: T) => JSX.Element;
    getAuthorization: (authorizations: Authorizations) => Authorization;
    update: UpdateComponent;
    title: string;
}

// An actual signature, which goes into an account transaction.
export type Signature = Buffer;

type KeyIndex = Word8;
// Signatures from a single credential, for an AccountTransaction
export type TransactionCredentialSignature = Record<KeyIndex, Signature>;

type CredentialIndex = Word8;
// The signature of an account transaction.
export type TransactionAccountSignature = Record<
    CredentialIndex,
    TransactionCredentialSignature
>;
