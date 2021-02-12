import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    TransactionHandler,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import EuroPerEnergyHandler from './EuroPerEnergyHandler';
import FoundationAccountHandler from './FoundationAccountHandler';
import MicroGtuPerEuroHandler from './MicroGtuPerEuroHandler';
import TransactionFeeDistributionHandler from './TransactionFeeDistributionHandler';

export default function findHandler(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): TransactionHandler<
    UpdateInstruction<UpdateInstructionPayload>,
    ConcordiumLedgerClient
> {
    switch (transaction.type) {
        case UpdateType.UpdateMicroGTUPerEuro:
            return new MicroGtuPerEuroHandler(transaction);
        case UpdateType.UpdateEuroPerEnergy:
            return new EuroPerEnergyHandler(transaction);
        case UpdateType.UpdateTransactionFeeDistribution:
            return new TransactionFeeDistributionHandler(transaction);
        case UpdateType.UpdateFoundationAccount:
            return new FoundationAccountHandler(transaction);
        default:
            throw new Error(
                `Unsupported transaction type: ${transaction.type}`
            );
    }
}
