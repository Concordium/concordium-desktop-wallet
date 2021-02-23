import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { UpdateComponent, TransactionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import EuroPerEnergyHandler from './EuroPerEnergyHandler';
import FoundationAccountHandler from './FoundationAccountHandler';
import GasRewardsHandler from './GasRewardsHandler';
import MicroGtuPerEuroHandler from './MicroGtuPerEuroHandler';
import MintDistributionHandler from './MintDistributionHandler';
import TransactionFeeDistributionHandler from './TransactionFeeDistributionHandler';

class HandlerTypeMiddleware<T>
    implements
        TransactionHandler<
            UpdateInstruction<UpdateInstructionPayload>,
            ConcordiumLedgerClient
        > {
    base: TransactionHandler<T, ConcordiumLedgerClient>;

    update: UpdateComponent;

    constructor(base: TransactionHandler<T, ConcordiumLedgerClient>) {
        this.base = base;
        this.update = base.update;
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
        case UpdateType.UpdateGASRewards:
            return new HandlerTypeMiddleware(new GasRewardsHandler());
        default:
            throw new Error(`Unsupported transaction type: ${type}`);
    }
}
