import { parse } from 'json-bigint';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    UpdateInstructionHandler,
    TransactionInput,
} from '~/utils/transactionTypes';
import {
    instanceOfUpdateInstruction,
    TransactionKindId,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
    Transaction,
} from '~/utils/types';
import ElectionDifficultyHandler from './ElectionDifficultyHandler';
import EuroPerEnergyHandler from './EuroPerEnergyHandler';
import FoundationAccountHandler from './FoundationAccountHandler';
import GasRewardsHandler from './GasRewardsHandler';
import MicroGtuPerEuroHandler from './MicroGtuPerEuroHandler';
import MintDistributionHandler from './MintDistributionHandler';
import ProtocolUpdateHandler from './ProtocolUpdateHandler';
import TransactionFeeDistributionHandler from './TransactionFeeDistributionHandler';
import UpdateAccountCredentialsHandler from './UpdateAccountCredentialsHandler';
import SimpleTransferHandler from './SimpleTransferHandler';
import AccountHandlerTypeMiddleware from './AccountTransactionHandlerMiddleware';
import UpdateHandlerTypeMiddleware from './UpdateInstructionHandlerMiddleware';

export function findAccountTransactionHandler(
    transactionKind: TransactionKindId
) {
    if (transactionKind === TransactionKindId.Update_credentials) {
        return new AccountHandlerTypeMiddleware(
            new UpdateAccountCredentialsHandler()
        );
    }
    if (transactionKind === TransactionKindId.Simple_transfer) {
        return new AccountHandlerTypeMiddleware(new SimpleTransferHandler());
    }
    throw new Error(`Unsupported transaction type: ${transactionKind}`);
}

export function findUpdateInstructionHandler(
    type: UpdateType
): UpdateInstructionHandler<
    UpdateInstruction<UpdateInstructionPayload>,
    ConcordiumLedgerClient
> {
    switch (type) {
        case UpdateType.UpdateMicroGTUPerEuro:
            return new UpdateHandlerTypeMiddleware(
                new MicroGtuPerEuroHandler()
            );
        case UpdateType.UpdateEuroPerEnergy:
            return new UpdateHandlerTypeMiddleware(new EuroPerEnergyHandler());
        case UpdateType.UpdateTransactionFeeDistribution:
            return new UpdateHandlerTypeMiddleware(
                new TransactionFeeDistributionHandler()
            );
        case UpdateType.UpdateFoundationAccount:
            return new UpdateHandlerTypeMiddleware(
                new FoundationAccountHandler()
            );
        case UpdateType.UpdateMintDistribution:
            return new UpdateHandlerTypeMiddleware(
                new MintDistributionHandler()
            );
        case UpdateType.UpdateProtocol:
            return new UpdateHandlerTypeMiddleware(new ProtocolUpdateHandler());
        case UpdateType.UpdateGASRewards:
            return new UpdateHandlerTypeMiddleware(new GasRewardsHandler());
        case UpdateType.UpdateElectionDifficulty:
            return new UpdateHandlerTypeMiddleware(
                new ElectionDifficultyHandler()
            );
        default:
            throw new Error(`Unsupported transaction type: ${type}`);
    }
}

export default function findHandler(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        return findUpdateInstructionHandler(transaction.type);
    }
    return findAccountTransactionHandler(transaction.transactionKind);
}

export function createUpdateInstructionHandler(
    state: TransactionInput | undefined
) {
    if (!state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }
    const { transaction, type } = state;

    const transactionObject = parse(transaction);
    // TODO Add AccountTransactionHandler here when implemented.

    if (type === 'UpdateInstruction') {
        return findUpdateInstructionHandler(transactionObject.type);
    }
    throw new Error('Account transaction support not yet implemented.');
}
