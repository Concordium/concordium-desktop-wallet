import { Buffer } from 'buffer/';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import ProtocolUpdateView from '~/pages/multisig/updates/Protocol/ProtocolUpdateView';
import UpdateProtocol, {
    UpdateProtocolFields,
} from '~/pages/multisig/updates/Protocol/UpdateProtocol';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isProtocolUpdate,
    MultiSignatureTransaction,
    ProtocolUpdate,
    UpdateInstruction,
    UpdateType,
} from '../types';
import { serializeProtocolUpdate } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update chain protocol';

type TransactionType = UpdateInstruction<ProtocolUpdate>;

export default class ProtocolUpdateHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isProtocolUpdate);
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { specificationAuxiliaryData: files, ...fields }: UpdateProtocolFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const { threshold } = blockSummary.updates.keys.level2Keys.protocol;
        const sequenceNumber =
            blockSummary.updates.updateQueues.protocol.nextSequenceNumber;

        let specificationAuxiliaryData: string | undefined;
        if (files) {
            const file = files.item(0);
            if (!file) {
                throw new Error(
                    'An auxiliary file was expected but was not present.'
                );
            }
            const ab = await file.arrayBuffer();
            specificationAuxiliaryData = Buffer.from(ab).toString('base64');
        }

        const protocolUpdate: ProtocolUpdate = {
            ...fields,
            specificationAuxiliaryData,
        };

        return createUpdateMultiSignatureTransaction(
            protocolUpdate,
            UpdateType.UpdateProtocol,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
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
}
