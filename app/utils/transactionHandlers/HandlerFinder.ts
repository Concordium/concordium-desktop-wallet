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
    instanceOfAddBaker,
    instanceOfUpdateBakerKeys,
    instanceOfRemoveBaker,
    instanceOfUpdateBakerStake,
    instanceOfUpdateBakerRestakeEarnings,
    instanceOfConfigureBaker,
    instanceOfConfigureDelegation,
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
import ScheduledTransferHandler from './ScheduledTransferHandler';
import AccountHandlerTypeMiddleware from './AccountTransactionHandlerMiddleware';
import UpdateInstructionHandlerTypeMiddleware from './UpdateInstructionHandlerMiddleware';
import UpdateRootKeysHandler from './UpdateRootsKeysHandler';
import UpdateLevel1KeysWithRootKeysHandler from './UpdateLevel1KeysWithRootKeysHandler';
import UpdateLevel1KeysWithLevel1KeysHandler from './UpdateLevel1KeysWithLevel1KeysHandler';
import TransferToEncryptedHandler from './TransferToEncryptedHandler';
import TransferToPublicHandler from './TransferToPublicHandler';
import UpdateLevel2KeysUsingRootKeysHandler from './UpdateLevel2KeysWithRootKeysHandler';
import UpdateLevel2KeysUsingLevel1KeysHandler from './UpdateLevel2KeysWithLevel1KeysHandler';
import AddIdentityProviderHandler from './AddIdentityProviderHandler';
import AddAnonymityRevokerHandler from './AddAnonymityRevokerHandler';
import ScheduledTransferWithMemoHandler from './ScheduledTransferWithMemoHandler';
import EncryptedTransferWithMemoHandler from './EncryptedTransferWithMemoHandler';
import SimpleTransferWithMemoHandler from './SimpleTransferWithMemoHandler';
import EncryptedTransferHandler from './EncryptedTransferHandler';
import StakingHandler from './StakingHandler';
import { parse } from '../JSONHelper';

import RegisterDataHandler from './RegisterDataHandler';
import TimeParametersHandler from './TimeParameterHandler';
import CooldownParametersHandler from './CooldownParametersHandler';
import PoolParametersHandler from './PoolParametersHandlers';
import { throwLoggedError } from '../basicHelpers';
import BlockEnergyLimitHandler from './BlockEnergyLimitHandler';
import FinalizationCommitteeParametersHandler from './FinalizationCommitteeParametersHandler';
import MinBlockTimeHandler from './MinBlockTimeHandler';

export function findAccountTransactionHandler(
    transactionKind: TransactionKindId
): AccountTransactionHandler<
    AccountTransaction,
    ConcordiumLedgerClient,
    Transaction
> {
    switch (transactionKind) {
        case TransactionKindId.Update_credentials:
            return new AccountHandlerTypeMiddleware(
                new UpdateAccountCredentialsHandler()
            );
        case TransactionKindId.Simple_transfer:
            return new AccountHandlerTypeMiddleware(
                new SimpleTransferHandler()
            );
        case TransactionKindId.Simple_transfer_with_memo:
            return new AccountHandlerTypeMiddleware(
                new SimpleTransferWithMemoHandler()
            );
        case TransactionKindId.Add_baker:
            return new AccountHandlerTypeMiddleware(
                new StakingHandler('Add baker', instanceOfAddBaker)
            );
        case TransactionKindId.Update_baker_keys:
            return new AccountHandlerTypeMiddleware(
                new StakingHandler(
                    'Update baker keys',
                    instanceOfUpdateBakerKeys
                )
            );
        case TransactionKindId.Remove_baker:
            return new AccountHandlerTypeMiddleware(
                new StakingHandler('Remove baker', instanceOfRemoveBaker)
            );
        case TransactionKindId.Update_baker_stake:
            return new AccountHandlerTypeMiddleware(
                new StakingHandler(
                    'Update baker stake',
                    instanceOfUpdateBakerStake
                )
            );
        case TransactionKindId.Update_baker_restake_earnings:
            return new AccountHandlerTypeMiddleware(
                new StakingHandler(
                    'Update baker restake earnings',
                    instanceOfUpdateBakerRestakeEarnings
                )
            );
        case TransactionKindId.Encrypted_transfer:
            return new AccountHandlerTypeMiddleware(
                new EncryptedTransferHandler()
            );
        case TransactionKindId.Encrypted_transfer_with_memo:
            return new AccountHandlerTypeMiddleware(
                new EncryptedTransferWithMemoHandler()
            );
        case TransactionKindId.Transfer_with_schedule:
            return new AccountHandlerTypeMiddleware(
                new ScheduledTransferHandler()
            );
        case TransactionKindId.Transfer_with_schedule_and_memo:
            return new AccountHandlerTypeMiddleware(
                new ScheduledTransferWithMemoHandler()
            );
        case TransactionKindId.Transfer_to_encrypted:
            return new AccountHandlerTypeMiddleware(
                new TransferToEncryptedHandler()
            );
        case TransactionKindId.Transfer_to_public:
            return new AccountHandlerTypeMiddleware(
                new TransferToPublicHandler()
            );
        case TransactionKindId.Register_data:
            return new AccountHandlerTypeMiddleware(new RegisterDataHandler());
        case TransactionKindId.Configure_baker:
            return new AccountHandlerTypeMiddleware(
                new StakingHandler('Configure baker', instanceOfConfigureBaker)
            );
        case TransactionKindId.Configure_delegation:
            return new AccountHandlerTypeMiddleware(
                new StakingHandler(
                    'Configure delegation',
                    instanceOfConfigureDelegation
                )
            );
        default:
            return throwLoggedError(
                `Unsupported transaction type: ${transactionKind}`
            );
    }
}

export function findUpdateInstructionHandler(
    type: UpdateType
): UpdateInstructionHandler<
    UpdateInstruction<UpdateInstructionPayload>,
    ConcordiumLedgerClient,
    Transaction
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
        case UpdateType.UpdateMintDistributionV1:
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
        case UpdateType.UpdateLevel2KeysUsingRootKeys:
            return new UpdateInstructionHandlerTypeMiddleware(
                new UpdateLevel2KeysUsingRootKeysHandler()
            );
        case UpdateType.UpdateLevel2KeysUsingLevel1Keys:
            return new UpdateInstructionHandlerTypeMiddleware(
                new UpdateLevel2KeysUsingLevel1KeysHandler()
            );
        case UpdateType.AddIdentityProvider:
            return new UpdateInstructionHandlerTypeMiddleware(
                new AddIdentityProviderHandler()
            );
        case UpdateType.AddAnonymityRevoker:
            return new UpdateInstructionHandlerTypeMiddleware(
                new AddAnonymityRevokerHandler()
            );
        case UpdateType.TimeParameters:
            return new UpdateInstructionHandlerTypeMiddleware(
                new TimeParametersHandler()
            );
        case UpdateType.CooldownParameters:
            return new UpdateInstructionHandlerTypeMiddleware(
                new CooldownParametersHandler()
            );
        case UpdateType.PoolParameters:
            return new UpdateInstructionHandlerTypeMiddleware(
                new PoolParametersHandler()
            );
        case UpdateType.BlockEnergyLimit:
            return new UpdateInstructionHandlerTypeMiddleware(
                new BlockEnergyLimitHandler()
            );
        case UpdateType.FinalizationCommitteeParameters:
            return new UpdateInstructionHandlerTypeMiddleware(
                new FinalizationCommitteeParametersHandler()
            );
        case UpdateType.MinBlockTime:
            return new UpdateInstructionHandlerTypeMiddleware(
                new MinBlockTimeHandler()
            );
        default:
            return throwLoggedError(`Unsupported transaction type: ${type}`);
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
        throwLoggedError(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }
    const { transaction, type } = state;

    const transactionObject = parse(transaction);

    if (type === 'UpdateInstruction') {
        return findUpdateInstructionHandler(transactionObject.type);
    }
    return throwLoggedError('Account transaction support not yet implemented.');
}
