import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { TransactionHandler, UpdateInstruction, UpdateType } from '../types';
import EuroPerEnergyHandler from './EuroPerEnergyHandler';
import MicroGtuPerEuroHandler from './MicroGtuPerEuroHandler';

export default function findHandler(
    transaction: UpdateInstruction
): TransactionHandler<UpdateInstruction, ConcordiumLedgerClient> {
    switch (transaction.type) {
        case UpdateType.UpdateMicroGTUPerEuro:
            return new MicroGtuPerEuroHandler(transaction);
        case UpdateType.UpdateEuroPerEnergy:
            return new EuroPerEnergyHandler(transaction);
        default:
            throw new Error(
                `Unsupported transaction type: ${transaction.type}`
            );
    }
}
