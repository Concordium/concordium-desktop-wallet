import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import ProtocolUpdateView from '../../pages/multisig/ProtocolUpdateView';
import UpdateProtocol, {
    UpdateProtocolFields,
} from '../../pages/multisig/UpdateProtocol';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    isProtocolUpdate,
    MultiSignatureTransaction,
    ProtocolUpdate,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import { serializeProtocolUpdate } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<ProtocolUpdate>;

export default class ProtocolUpdateHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isProtocolUpdate(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { specificationAuxiliaryData: files, ...fields }: UpdateProtocolFields,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const { threshold } = blockSummary.updates.authorizations.protocol;
        const sequenceNumber =
            blockSummary.updates.updateQueues.protocol.nextSequenceNumber;

        const file = files.item(0);

        if (!file) {
            throw new Error('No auxiliary data file in update transaction');
        }

        const specificationAuxiliaryData = await file.text();

        const protocolUpdate: ProtocolUpdate = {
            ...fields,
            specificationAuxiliaryData,
        };

        return createUpdateMultiSignatureTransaction(
            protocolUpdate,
            UpdateType.UpdateProtocol,
            sequenceNumber,
            threshold,
            effectiveTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeProtocolUpdate(transaction.payload).serialization;
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signProtocolUpdate(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return ProtocolUpdateView({ protocolUpdate: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.protocol;
    }

    update = UpdateProtocol;

    title = 'Foundation Transaction | Update Chain Protocol';
}
