import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { TransactionHandler, UpdateInstruction, UpdateType } from '../types';
import EuroPerEnergy from './EuroPerEnergyHandler';
import MicroGtuPerEuro from './MicroGtuPerEuroHandler';

export default function findHandler(
    transaction: UpdateInstruction
): TransactionHandler<UpdateInstruction, ConcordiumLedgerClient> {
    switch (transaction.type) {
        case UpdateType.UpdateMicroGTUPerEuro:
            return new MicroGtuPerEuro(transaction);
        case UpdateType.UpdateEuroPerEnergy:
            return new EuroPerEnergy(transaction);
        default:
            throw new Error(
                `Unsupported transaction type: ${transaction.type}`
            );
    }
}
