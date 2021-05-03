import { parse } from 'json-bigint';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    UpdateInstructionHandler,
    AccountTransactionHandler,
    TransactionInput,
} from '~/utils/transactionTypes';
import {
    instanceOfUpdateInstruction,
    TransactionKindId,
    AccountTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
    Transaction,
} from '~/utils/types';
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
import SimpleTransferHandler from './SimpleTransferHandler';
import AccountHandlerTypeMiddleware from './AccountTransactionHandlerMiddleware';
import UpdateInstructionHandlerTypeMiddleware from './UpdateInstructionHandlerMiddleware';
import UpdateRootKeysHandler from './UpdateRootsKeysHandler';
import UpdateLevel1KeysWithRootKeysHandler from './UpdateLevel1KeysWithRootKeysHandler';
import UpdateLevel1KeysWithLevel1KeysHandler from './UpdateLevel1KeysWithLevel1KeysHandler';
import AddBakerHandler from './AddBakerHandler';
import UpdateBakerKeysHandler from './UpdateBakerKeysHandler';
import RemoveBakerHandler from './RemoveBakerHandler';

export function findAccountTransactionHandler(
    transactionKind: TransactionKindId
): AccountTransactionHandler<AccountTransaction, ConcordiumLedgerClient> {
    if (transactionKind === TransactionKindId.Update_credentials) {
        return new AccountHandlerTypeMiddleware(
            new UpdateAccountCredentialsHandler()
        );
    }
    if (transactionKind === TransactionKindId.Simple_transfer) {
        return new AccountHandlerTypeMiddleware(new SimpleTransferHandler());
    }
    if (transactionKind === TransactionKindId.Add_baker) {
        return new AccountHandlerTypeMiddleware(new AddBakerHandler());
    }
    if (transactionKind === TransactionKindId.Update_baker_keys) {
        return new AccountHandlerTypeMiddleware(new UpdateBakerKeysHandler());
    }
    if (transactionKind === TransactionKindId.Remove_baker) {
        return new AccountHandlerTypeMiddleware(new RemoveBakerHandler());
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
        case UpdateType.UpdateLevel1KeysUsingRootKeys:
            return new UpdateInstructionHandlerTypeMiddleware(
                new UpdateLevel1KeysWithRootKeysHandler()
            );
        case UpdateType.UpdateLevel1KeysUsingLevel1Keys:
            return new UpdateInstructionHandlerTypeMiddleware(
                new UpdateLevel1KeysWithLevel1KeysHandler()
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
