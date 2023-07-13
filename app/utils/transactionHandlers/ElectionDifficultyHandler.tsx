import React from 'react';
import {
    ElectionDifficultyField,
    toElectionDifficultyResolution,
} from '~/pages/multisig/updates/ElectionDifficulty/ElectionDifficultyInput/ElectionDifficultyInput';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import ElectionDifficultyView from '../../pages/multisig/updates/ElectionDifficulty/ElectionDifficultyView';
import UpdateElectionDifficulty from '../../pages/multisig/updates/ElectionDifficulty/UpdateElectionDifficulty';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    UpdateQueues,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    ElectionDifficulty,
    isElectionDifficulty,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateType,
} from '../types';
import { serializeElectionDifficulty } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update election difficulty';

type TransactionType = UpdateInstruction<ElectionDifficulty>;

export default class ElectionDifficultyHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isElectionDifficulty);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        updateQueues: UpdateQueues,
        { electionDifficulty }: ElectionDifficultyField,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !updateQueues) {
            return undefined;
        }

        const sequenceNumber =
            updateQueues.electionDifficulty.nextSequenceNumber;
        const { threshold } = chainParameters.level2Keys.electionDifficulty;
        const parsedElectionDifficulty = toElectionDifficultyResolution(
            electionDifficulty
        );

        if (parsedElectionDifficulty === undefined) {
            return undefined;
        }

        return createUpdateMultiSignatureTransaction(
            {
                electionDifficulty: Number(parsedElectionDifficulty),
            },
            UpdateType.UpdateElectionDifficulty,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeElectionDifficulty(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signElectionDifficulty(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <ElectionDifficultyView
                electionDifficulty={transaction.payload.electionDifficulty}
            />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.electionDifficulty;
    }

    update = UpdateElectionDifficulty;
}
