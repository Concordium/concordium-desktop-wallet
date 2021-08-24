import { Buffer } from 'buffer/';
import EventEmitter from 'events';
import { parse } from '~/utils/JSONHelper';
import {
    closeTransport,
    getLedgerClient,
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
        getIdCredSec: (identity: number) =>
            getLedgerClient().getIdCredSec(identity),
        getPrfKey: (identity: number) => getLedgerClient().getPrfKey(identity),
        signTransfer: (transactionAsJson: string, keypath: number[]) => {
            const transaction: AccountTransaction = parse(transactionAsJson);
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
            transactionAsJson: string,
            path: number[]
        ) => {
            const transaction: UpdateAccountCredentials = parse(
                transactionAsJson
            );
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
            expiry: string,
            keypath: number[]
        ) => {
            return getLedgerClient().signCredentialDeploymentOnNewAccount(
                credentialDeployment,
                parse(expiry),
                keypath
            );
        },
        signMicroGtuPerEuro: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<ExchangeRate> = parse(
                transactionAsJson
            );
            return getLedgerClient().signMicroGtuPerEuro(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signEuroPerEnergy: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<ExchangeRate> = parse(
                transactionAsJson
            );
            return getLedgerClient().signEuroPerEnergy(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signTransactionFeeDistribution: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<TransactionFeeDistribution> = parse(
                transactionAsJson
            );
            return getLedgerClient().signTransactionFeeDistribution(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signFoundationAccount: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<FoundationAccount> = parse(
                transactionAsJson
            );
            return getLedgerClient().signFoundationAccount(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signMintDistribution: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<MintDistribution> = parse(
                transactionAsJson
            );
            return getLedgerClient().signMintDistribution(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signProtocolUpdate: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<ProtocolUpdate> = parse(
                transactionAsJson
            );
            return getLedgerClient().signProtocolUpdate(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signAddIdentityProvider: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<AddIdentityProvider> = parse(
                transactionAsJson
            );
            return getLedgerClient().signAddIdentityProvider(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signGasRewards: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<GasRewards> = parse(
                transactionAsJson
            );
            return getLedgerClient().signGasRewards(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signBakerStakeThreshold: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<BakerStakeThreshold> = parse(
                transactionAsJson
            );
            return getLedgerClient().signBakerStakeThreshold(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signElectionDifficulty: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[]
        ) => {
            const transaction: UpdateInstruction<ElectionDifficulty> = parse(
                transactionAsJson
            );
            return getLedgerClient().signElectionDifficulty(
                transaction,
                serializedPayload,
                keypath
            );
        },
        signHigherLevelKeysUpdate: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[],
            INS: number
        ) => {
            const transaction: UpdateInstruction<HigherLevelKeyUpdate> = parse(
                transactionAsJson
            );
            return getLedgerClient().signHigherLevelKeysUpdate(
                transaction,
                serializedPayload,
                keypath,
                INS
            );
        },
        signAuthorizationKeysUpdate: (
            transactionAsJson: string,
            serializedPayload: Buffer,
            keypath: number[],
            INS: number
        ) => {
            const transaction: UpdateInstruction<AuthorizationKeysUpdate> = parse(
                transactionAsJson
            );
            return getLedgerClient().signAuthorizationKeysUpdate(
                transaction,
                serializedPayload,
                keypath,
                INS
            );
        },
        getAppAndVersion: () => getLedgerClient().getAppAndVersion(),
        subscribe: () => subscribeLedger(eventEmitter),
        closeTransport,
    };
}
