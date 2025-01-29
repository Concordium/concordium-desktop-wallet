import { RejectReasonTag as RejectReason } from '@concordium/web-sdk/types';

export { RejectReason };

/**
 * Translates a reject reason to its corresponding display text that can be
 * shown to the user.
 * @param rejectReason reason for rejection
 * @returns a displayable version of the rejection
 */
export function rejectReasonToDisplayText(
    rejectReason?: RejectReason | string
) {
    // A rejection reason might not have been received yet, and so we show that
    // to the user.
    if (!rejectReason) {
        return 'Rejection reason is missing';
    }

    if (!(rejectReason in RejectReason)) {
        return rejectReason;
    }

    switch (rejectReason) {
        case RejectReason.ModuleNotWF:
            return 'Smart contract module failed to typecheck';
        case RejectReason.ModuleHashAlreadyExists:
            return 'A module with the same hash already exists';
        case RejectReason.InvalidAccountReference:
            return 'The referenced account does not exist';
        case RejectReason.InvalidInitMethod:
            return 'Invalid Initial method, no such contract found in module';
        case RejectReason.InvalidReceiveMethod:
            return 'Invalid receive function in module, missing receive function in contract';
        case RejectReason.InvalidModuleReference:
            return 'Referenced module does not exists';
        case RejectReason.InvalidContractAddress:
            return 'No smart contract instance exists with the given contract address';
        case RejectReason.RuntimeFailure:
            return 'Runtime failure while executing smart contract';
        case RejectReason.AmountTooLarge:
            return 'Insufficient funds';
        case RejectReason.SerializationFailure:
            return 'The transaction body was malformed';
        case RejectReason.OutOfEnergy:
            return 'The transaction ran out of energy';
        case RejectReason.RejectedInit:
            return 'Contract refused to initialize';
        case RejectReason.RejectedReceive:
            return 'Rejected by contract logic';
        case RejectReason.NonExistentRewardAccount:
            return 'The designated reward account does not exist';
        case RejectReason.InvalidProof:
            return 'Proof that the validator owns relevant private keys is not valid';
        case RejectReason.AlreadyABaker:
            return 'Validator with ID already exists';
        case RejectReason.NotABaker:
            return 'Account is not a validator';
        case RejectReason.InsufficientBalanceForBakerStake:
            return 'Sender account has insufficient balance to cover the requested stake';
        case RejectReason.StakeUnderMinimumThresholdForBaking:
            return 'The amount provided is under the threshold required for becoming a validator';
        case RejectReason.BakerInCooldown:
            return 'Request to make change to the validator while the validator is in the cooldown period';
        case RejectReason.DuplicateAggregationKey:
            return 'Duplicate aggregation key';
        case RejectReason.NonExistentCredentialID:
            return 'Encountered credential ID that does not exist on the account';
        case RejectReason.KeyIndexAlreadyInUse:
            return 'The requested key index is already in use';
        case RejectReason.InvalidAccountThreshold:
            return 'The account threshold would exceed the number of credentials';
        case RejectReason.InvalidCredentialKeySignThreshold:
            return 'The signature threshold would exceed the number of keys of the credential';
        case RejectReason.InvalidEncryptedAmountTransferProof:
            return 'The shielded amount transfer has an invalid proof';
        case RejectReason.InvalidTransferToPublicProof:
            return 'The unshield amount has an invalid proof';
        case RejectReason.EncryptedAmountSelfTransfer:
            return 'An shielded amount transfer from the account to itself is not allowed';
        case RejectReason.InvalidIndexOnEncryptedTransfer:
            return 'The provided shielded transfer index is out of bounds';
        case RejectReason.ZeroScheduledAmount:
            return 'Attempt to transfer 0 CCD with schedule';
        case RejectReason.NonIncreasingSchedule:
            return 'Attempt to transfer amount with non-increasing schedule';
        case RejectReason.FirstScheduledReleaseExpired:
            return 'The first scheduled release is in the past';
        case RejectReason.ScheduledSelfTransfer:
            return 'Attempt to transfer from an account to itself with a schedule';
        case RejectReason.InvalidCredentials:
            return 'One or more of the credentials';
        case RejectReason.DuplicateCredIDs:
            return 'There was a duplicate credential registration id';
        case RejectReason.NonExistentCredIDs:
            return 'The credential registration id does not exist';
        case RejectReason.RemoveFirstCredential:
            return 'First credential of the account cannot be removed';
        case RejectReason.CredentialHolderDidNotSign:
            return 'Credential holder did not sign the credential key update';
        case RejectReason.NotAllowedMultipleCredentials:
            return 'Account is not allowed to have multiple credentials because it has non-zero encrypted balance';
        case RejectReason.NotAllowedToReceiveEncrypted:
            return 'Account is not allowed to receive encrypted transfers because it has multiple credentials';
        case RejectReason.NotAllowedToHandleEncrypted:
            return 'Account is not allowed to handle encrypted transfers because it has multiple credentials';
        case RejectReason.MissingBakerAddParameters:
            return 'Missing parameters to add new validator';
        case RejectReason.FinalizationRewardCommissionNotInRange:
            return 'Finalization reward commission was not within the allowed range';
        case RejectReason.BakingRewardCommissionNotInRange:
            return 'Block reward commission was not within the allowed range';
        case RejectReason.TransactionFeeCommissionNotInRange:
            return 'Transaction fee commission was not within the allowed range';
        case RejectReason.AlreadyADelegator:
            return 'The account is already a delegator';
        case RejectReason.InsufficientBalanceForDelegationStake:
            return 'The balance on the account is insufficient to cover the desired stake';
        case RejectReason.MissingDelegationAddParameters:
            return 'Missing parameters to add new delegator';
        case RejectReason.InsufficientDelegationStake:
            return 'Not allowed to add delegator with 0 stake';
        case RejectReason.DelegatorInCooldown:
            return 'The change could not be made because the delegator is in cooldown';
        case RejectReason.NotADelegator:
            return 'Account is not a delegator';
        case RejectReason.DelegationTargetNotABaker:
            return 'Delegation target is not a validator';
        case RejectReason.StakeOverMaximumThresholdForPool:
            return "Staking pool's total capital would become too large";
        case RejectReason.PoolWouldBecomeOverDelegated:
            return 'Fraction of delegated capital to staking pool would become too large';
        case RejectReason.PoolClosed:
            return 'Pool is not open for delegation';
        default:
            return 'Unknown rejection reason';
    }
}
