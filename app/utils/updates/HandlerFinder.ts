import { parse } from 'json-bigint';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { Authorizations } from '../NodeApiTypes';
import {
    UpdateComponent,
    TransactionHandler,
    TransactionInput,
} from '../transactionTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import ElectionDifficultyHandler from './ElectionDifficultyHandler';
import EuroPerEnergyHandler from './EuroPerEnergyHandler';
import FoundationAccountHandler from './FoundationAccountHandler';
import GasRewardsHandler from './GasRewardsHandler';
import MicroGtuPerEuroHandler from './MicroGtuPerEuroHandler';
import MintDistributionHandler from './MintDistributionHandler';
import ProtocolUpdateHandler from './ProtocolUpdateHandler';
import TransactionFeeDistributionHandler from './TransactionFeeDistributionHandler';

class HandlerTypeMiddleware<T>
    implements
        TransactionHandler<
            UpdateInstruction<UpdateInstructionPayload>,
            ConcordiumLedgerClient
        > {
    base: TransactionHandler<T, ConcordiumLedgerClient>;

    update: UpdateComponent;

    title: string;

    constructor(base: TransactionHandler<T, ConcordiumLedgerClient>) {
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

export default function findHandler(
    type: UpdateType
): TransactionHandler<
    UpdateInstruction<UpdateInstructionPayload>,
    ConcordiumLedgerClient
> {
    switch (type) {
        case UpdateType.UpdateMicroGTUPerEuro:
            return new HandlerTypeMiddleware(new MicroGtuPerEuroHandler());
        case UpdateType.UpdateEuroPerEnergy:
            return new HandlerTypeMiddleware(new EuroPerEnergyHandler());
        case UpdateType.UpdateTransactionFeeDistribution:
            return new HandlerTypeMiddleware(
                new TransactionFeeDistributionHandler()
            );
        case UpdateType.UpdateFoundationAccount:
            return new HandlerTypeMiddleware(new FoundationAccountHandler());
        case UpdateType.UpdateMintDistribution:
            return new HandlerTypeMiddleware(new MintDistributionHandler());
        case UpdateType.UpdateProtocol:
            return new HandlerTypeMiddleware(new ProtocolUpdateHandler());
        case UpdateType.UpdateGASRewards:
            return new HandlerTypeMiddleware(new GasRewardsHandler());
        case UpdateType.UpdateElectionDifficulty:
            return new HandlerTypeMiddleware(new ElectionDifficultyHandler());
        default:
            throw new Error(`Unsupported transaction type: ${type}`);
    }
}

export function createTransactionHandler(state: TransactionInput | undefined) {
    if (!state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }
    const { transaction, type } = state;

    const transactionObject = parse(transaction);
    // TODO Add AccountTransactionHandler here when implemented.

    if (type === 'UpdateInstruction') {
        const handler = findHandler(transactionObject.type);
        return handler;
    }
    throw new Error('Account transaction support not yet implemented.');
}
