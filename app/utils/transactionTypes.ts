import { AccountPathInput } from '~/features/ledger/Path';
import { Authorization, Authorizations, BlockSummary } from './NodeApiTypes';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateInstruction,
    AddressBookEntry,
    HigherLevelKeyUpdate,
    AccountTransaction,
    Schedule,
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
    handleKeySubmit?(
        effectiveTime: Date,
        higherLevelKeyUpdate: HigherLevelKeyUpdate
    ): Promise<void>;
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

export type PrintComponent<T> = (
    transaction: T,
    status: MultiSignatureTransactionStatus,
    identiconImage?: string
) => JSX.Element | undefined;

/**
 * Interface definition for a class that handles a specific type
 * of transaction.
 */
export type TransactionHandler<T, S> =
    | UpdateInstructionHandler<T, S>
    | AccountTransactionHandler<T, S>;

/**
 * Interface definition for a class that handles a specific type
 * of update instructions.
 */
export interface UpdateInstructionHandler<T, S, P = UpdateInstruction> {
    /**
     * Used to resolve type ambiguity. N.B. If given another type of update than T,
     * this might throw an error.
     */
    confirmType: (transaction: P) => T;
    /**
     * Creates a instance of update type T.
     * if the fields are not appropiate, will return undefined
     */
    createTransaction: (
        blockSummary: BlockSummary,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: any,
        effectiveTime: bigint
    ) => Promise<Partial<MultiSignatureTransaction> | undefined>;
    serializePayload: (transaction: T) => Buffer;
    signTransaction: (transaction: T, signer: S) => Promise<Buffer>;
    /**
     * Returns a React element, in which the details of the transaction are displayed
     */
    view: (transaction: T) => JSX.Element;
    /**
     * Returns a React element, which contains the details of the transaction for print
     */
    print: PrintComponent<P>;
    getAuthorization: (authorizations: Authorizations) => Authorization;
    /**
     * Returns a React element, in which the update's fields can be chosen.
     */
    update: UpdateComponent;
    type: string;
    title: string;
}

export interface CreateTransactionInput {
    sender: string;
    recipient: string;
    amount: bigint;
    schedule: Schedule;
    signatureAmount: number;
}

/**
 * Interface definition for a class that handles a specific type
 * of account transaction.
 */
export interface AccountTransactionHandler<T, S, P = AccountTransaction> {
    /**
     * Used to resolve type ambiguity. N.B. If given another type of transaction than T,
     * this might throw an error.
     */
    confirmType: (transaction: P) => T;
    serializePayload: (transaction: T) => Buffer;
    signTransaction: (
        transaction: T,
        signer: S,
        path: AccountPathInput
    ) => Promise<Buffer>;
    /**
     * Returns a React element, in which the details of the transaction are displayed
     */
    view: (transaction: T) => JSX.Element;
    /**
     * Returns a React element, which contains the details of the transaction for print
     */
    print: PrintComponent<P>;
    createTransaction: (
        informationBlob: Partial<CreateTransactionInput>
    ) => Promise<T>;
    creationLocationHandler: (currentLocation: string) => string;
    type: string;
    title: string;
}
