import { ValidatorScoreParameters } from '@concordium/web-sdk';
import { Buffer } from 'buffer/';
import EventEmitter from 'events';
import {
    closeTransport,
    getLedgerClient,
    resetTransport,
    subscribeLedger,
} from './ledgerObserverHelper';
import { AccountPathInput } from '~/features/ledger/Path';
import {
    AccountTransaction,
    PublicInformationForIp,
    UnsignedCredentialDeploymentInformation,
    UpdateInstruction,
    ExchangeRate,
    TransactionFeeDistribution,
    FoundationAccount,
    MintDistribution,
    ProtocolUpdate,
    GasRewards,
    BakerStakeThreshold,
    ElectionDifficulty,
    HigherLevelKeyUpdate,
    AuthorizationKeysUpdate,
    UpdateAccountCredentials,
    AddIdentityProvider,
    AddAnonymityRevoker,
    BlsKeyTypes,
    TimeParameters,
    CooldownParameters,
    PoolParameters,
    BlockEnergyLimit,
    FinalizationCommitteeParameters,
    MinBlockTime,
    TimeoutParameters,
} from '~/utils/types';
import { LedgerCommands } from '~/preload/preloadTypes';

export default function exposedMethods(
    eventEmitter: EventEmitter
): LedgerCommands {
    return {
        getPublicKey: (keypath: number[]) =>
            getLedgerClient().getPublicKey(keypath),
        getPublicKeySilent: (keypath: number[]) =>
            getLedgerClient().getPublicKeySilent(keypath),
        getSignedPublicKey: (keypath: number[]) =>
            getLedgerClient().getSignedPublicKey(keypath),
        getPrivateKeys: (identity: number, version: BlsKeyTypes) =>
            getLedgerClient().getPrivateKeys(identity, version),
        getPrfKeyRecovery: (identity: number) =>
            getLedgerClient().getPrfKeyRecovery(identity),
        getPrfKeyDecrypt: (identity: number, version: BlsKeyTypes) =>
            getLedgerClient().getPrfKeyDecrypt(identity, version),
        verifyAddress: (identity: number, credentialNumber: number) =>
            getLedgerClient().verifyAddress(identity, credentialNumber),
        signTransfer: (transaction: AccountTransaction, keypath: number[]) => {
            return getLedgerClient().signTransfer(transaction, keypath);
        },
        signPublicInformationForIp: (
            publicInfoForIp: PublicInformationForIp,
            accountPathInput: AccountPathInput
        ) => {
            return getLedgerClient().signPublicInformationForIp(
                publicInfoForIp,
                accountPathInput
            );
        },
        signUpdateCredentialTransaction: (
            transaction: UpdateAccountCredentials,
            path: number[]
        ) => {
            return getLedgerClient().signUpdateCredentialTransaction(
                transaction,
                path
            );
        },
        signCredentialDeploymentOnExistingAccount: (
            credentialDeployment: UnsignedCredentialDeploymentInformation,
            address: string,
            keypath: number[]
        ) => {
            return getLedgerClient().signCredentialDeploymentOnExistingAccount(
                credentialDeployment,
                address,
                keypath
            );
        },
        signCredentialDeploymentOnNewAccount: (
            credentialDeployment: UnsignedCredentialDeploymentInformation,
            expiry: bigint,
            keypath: number[]
        ) => {
            return getLedgerClient().signCredentialDeploymentOnNewAccount(
                credentialDeployment,
                expiry,
                keypath
            );
        },
        signMicroGtuPerEuro: (
            transaction: UpdateInstruction<ExchangeRate>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signMicroGtuPerEuro(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signEuroPerEnergy: (
            transaction: UpdateInstruction<ExchangeRate>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signEuroPerEnergy(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signTransactionFeeDistribution: (
            transaction: UpdateInstruction<TransactionFeeDistribution>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signTransactionFeeDistribution(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signFoundationAccount: (
            transaction: UpdateInstruction<FoundationAccount>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signFoundationAccount(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signMintDistribution: (
            transaction: UpdateInstruction<MintDistribution>,
            serializedPayload: Buffer,
            version: number,
            keypath: number[]
        ) => {
            return getLedgerClient().signMintDistribution(
                transaction,
                serializedPayload,
                version,
                keypath
            );
        },
        signProtocolUpdate: (
            transaction: UpdateInstruction<ProtocolUpdate>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signProtocolUpdate(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signAddAnonymityRevoker: (
            transaction: UpdateInstruction<AddAnonymityRevoker>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signAddAnonymityRevoker(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signAddIdentityProvider: (
            transaction: UpdateInstruction<AddIdentityProvider>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signAddIdentityProvider(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signGasRewards: (
            transaction: UpdateInstruction<GasRewards>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signGasRewards(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signBakerStakeThreshold: (
            transaction: UpdateInstruction<BakerStakeThreshold>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signBakerStakeThreshold(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signElectionDifficulty: (
            transaction: UpdateInstruction<ElectionDifficulty>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signElectionDifficulty(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signHigherLevelKeysUpdate: (
            transaction: UpdateInstruction<HigherLevelKeyUpdate>,
            serializedPayload: Buffer,
            keypath: number[],
            INS: number
        ) => {
            return getLedgerClient().signHigherLevelKeysUpdate(
                transaction,
                serializedPayload,
                keypath,
                INS
            );
        },
        signAuthorizationKeysUpdate: (
            transaction: UpdateInstruction<AuthorizationKeysUpdate>,
            serializedPayload: Buffer,
            keypath: number[],
            INS: number,
            version: number
        ) => {
            return getLedgerClient().signAuthorizationKeysUpdate(
                transaction,
                serializedPayload,
                keypath,
                INS,
                version
            );
        },
        signTimeParameters: (
            transaction: UpdateInstruction<TimeParameters>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signTimeParameters(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signCooldownParameters: (
            transaction: UpdateInstruction<CooldownParameters>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signCooldownParameters(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signPoolParameters: (
            transaction: UpdateInstruction<PoolParameters>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signPoolParameters(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signBlockEnergyLimit: (
            transaction: UpdateInstruction<BlockEnergyLimit>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signBlockEnergyLimit(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signFinalizationCommitteeParameters: (
            transaction: UpdateInstruction<FinalizationCommitteeParameters>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signFinalizationCommitteeParameters(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signValidatorScoreParameters: (
            transaction: UpdateInstruction<ValidatorScoreParameters>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signValidatorScoreParameters(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signMinBlockTime: (
            transaction: UpdateInstruction<MinBlockTime>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signMinBlockTime(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signTimeoutParameters: (
            transaction: UpdateInstruction<TimeoutParameters>,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            return getLedgerClient().signTimeoutParameters(
                transaction,
                serializedPayload,
                keypath
            );
        },
        getAppAndVersion: () => getLedgerClient().getAppAndVersion(),
        subscribe: () => subscribeLedger(eventEmitter),
        closeTransport,
        resetTransport: () => resetTransport(eventEmitter),
    };
}
