import type { Buffer } from 'buffer/';
import { FieldValues } from 'react-hook-form';
import { AccountPathInput } from '~/features/ledger/Path';
import {
    Authorization,
    Authorizations,
    BlockSummary,
    ConsensusStatus,
} from '../node/NodeApiTypes';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateInstruction,
    AddressBookEntry,
    HigherLevelKeyUpdate,
    AccountTransaction,
    Schedule,
    AuthorizationKeysUpdate,
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
    defaults: FieldValues;
    blockSummary: BlockSummary;
    consensusStatus: ConsensusStatus;
    handleHigherLevelKeySubmit?(
        effectiveTime: Date,
        expiryTime: Date,
        higherLevelKeyUpdate: HigherLevelKeyUpdate
    ): Promise<void>;
    handleAuthorizationKeySubmit?(
        effectiveTime: Date,
        expiryTime: Date,
        authorizationKeysUpdate: AuthorizationKeysUpdate
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
    memo?: string;
}

export type UpdateComponent = (props: UpdateProps) => JSX.Element | null;

export type PrintComponent<T> = (
    transaction: T,
    status: MultiSignatureTransactionStatus,
    identiconImage?: string
) => JSX.Element | undefined;

export type TransactionViewComponent<T> = (transaction: T) => JSX.Element;

/**
 * Interface definition for a class that handles a specific type
 * of transaction.
 */
export type TransactionHandler<T, S> =
    | UpdateInstructionHandler<T, S>
    | AccountTransactionHandler<T, S>;

export enum TransactionExportType {
    Signature = 'signature',
    Proposal = 'proposal',
}

interface TransactionHandlerBase<T, P> {
    /**
     * Used to resolve type ambiguity. N.B. If given another type of update than T,
     * this might throw an error.
     */
    confirmType(transaction: P): T;
    getFileNameForExport(
        transaction: P,
        exportType: TransactionExportType
    ): string;
    serializePayload(transaction: T): Buffer;
    /**
     * Returns a React element, in which the details of the transaction are displayed
     */
    view: TransactionViewComponent<T>;
    print: PrintComponent<P>;
    type: string;
    title: string;
}

/**
 * Interface definition for a class that handles a specific type
 * of update instructions.
 * T = Instruction type that the handler handles
 * S = The class which signs the transaction
 * P = 'Parent' type of the transaction.
 */
export interface UpdateInstructionHandler<T, S, P = UpdateInstruction>
    extends TransactionHandlerBase<T, P> {
    /**
     * Creates a instance of update type T.
     * if the fields are not appropiate, will return undefined
     */
    createTransaction: (
        blockSummary: BlockSummary,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: any,
        effectiveTime: bigint,
        expiryTime: bigint
    ) => Promise<Omit<MultiSignatureTransaction, 'id'> | undefined>;
    signTransaction: (transaction: T, signer: S) => Promise<Buffer>;
    /**
     * Returns a React element, which contains the details of the transaction for print
     */
    getAuthorization: (authorizations: Authorizations) => Authorization;
    /**
     * Returns a React element, in which the update's fields can be chosen.
     */
    update: UpdateComponent;
}

export interface CreateTransactionInput {
    sender: string;
    recipient: string;
    amount: bigint;
    schedule: Schedule;
    signatureAmount: number;
    nonce: bigint;
    expiryTime: Date;
    memo: string;
    data: string;
}

/**
 * Interface definition for a class that handles a specific type
 * of account transaction.
 * T = Transaction kind that the handler handles
 * S = The class which signs the transaction
 * P = 'Parent' type of the transaction.
 */
export interface AccountTransactionHandler<T, S, P = AccountTransaction>
    extends TransactionHandlerBase<T, P> {
    signTransaction: (
        transaction: T,
        signer: S,
        path: AccountPathInput,
        displayMessage?: (message: string | JSX.Element) => void
    ) => Promise<Buffer>;
    /**
     * Returns a React element, which contains the details of the transaction for print
     */
    createTransaction: (informationBlob: Partial<CreateTransactionInput>) => T;
    creationLocationHandler: (currentLocation: string) => string;
}
