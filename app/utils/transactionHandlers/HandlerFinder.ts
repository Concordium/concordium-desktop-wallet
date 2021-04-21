import { parse } from 'json-bigint';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    UpdateInstructionHandler,
    TransactionInput,
    AccountTransactionHandler,
} from '../transactionTypes';
import {
    instanceOfUpdateInstruction,
    TransactionKindId,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
    Transaction,
    AccountTransaction,
} from '../types';
import BakerStakeThresholdHandler from './BakerStakeThresholdHandler';
import ElectionDifficultyHandler from './ElectionDifficultyHandler';
import EuroPerEnergyHandler from './EuroPerEnergyHandler';
import FoundationAccountHandler from './FoundationAccountHandler';
import GasRewardsHandler from './GasRewardsHandler';
import MicroGtuPerEuroHandler from './MicroGtuPerEuroHandler';
import MintDistributionHandler from './MintDistributionHandler';
import ProtocolUpdateHandler from './ProtocolUpdateHandler';
import TransactionFeeDistributionHandler from './TransactionFeeDistributionHandler';
import UpdateAccountCredentialsHandler from './UpdateAccountCredentialsHandler';
import AccountHandlerTypeMiddleware from './AccountTransactionHandlerMiddleware';
import UpdateInstructionHandlerTypeMiddleware from './UpdateInstructionHandlerMiddleware';
import UpdateRootKeysHandler from './UpdateRootsKeysHandler';

export function findAccountTransactionHandler(
    transactionKind: TransactionKindId
): AccountTransactionHandler<AccountTransaction, ConcordiumLedgerClient> {
    if (transactionKind === TransactionKindId.Update_credentials) {
        return new AccountHandlerTypeMiddleware(
            new UpdateAccountCredentialsHandler()
        );
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
            return new UpdateInstructionHandlerTypeMiddleware(
                new MicroGtuPerEuroHandler()
            );
        case UpdateType.UpdateEuroPerEnergy:
            return new UpdateInstructionHandlerTypeMiddleware(
                new EuroPerEnergyHandler()
            );
        case UpdateType.UpdateTransactionFeeDistribution:
            return new UpdateInstructionHandlerTypeMiddleware(
                new TransactionFeeDistributionHandler()
            );
        case UpdateType.UpdateFoundationAccount:
            return new UpdateInstructionHandlerTypeMiddleware(
                new FoundationAccountHandler()
            );
        case UpdateType.UpdateMintDistribution:
            return new UpdateInstructionHandlerTypeMiddleware(
                new MintDistributionHandler()
            );
        case UpdateType.UpdateProtocol:
            return new UpdateInstructionHandlerTypeMiddleware(
                new ProtocolUpdateHandler()
            );
        case UpdateType.UpdateGASRewards:
            return new UpdateInstructionHandlerTypeMiddleware(
                new GasRewardsHandler()
            );
        case UpdateType.UpdateBakerStakeThreshold:
            return new UpdateInstructionHandlerTypeMiddleware(
                new BakerStakeThresholdHandler()
            );
        case UpdateType.UpdateElectionDifficulty:
            return new UpdateInstructionHandlerTypeMiddleware(
                new ElectionDifficultyHandler()
            );
        case UpdateType.UpdateRootKeys:
            return new UpdateInstructionHandlerTypeMiddleware(
                new UpdateRootKeysHandler()
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

    if (type === 'UpdateInstruction') {
        return findUpdateInstructionHandler(transactionObject.type);
    }
    throw new Error('Account transaction support not yet implemented.');
}
