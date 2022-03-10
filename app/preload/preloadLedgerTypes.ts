import { Buffer } from 'buffer/';
import {
    PrivateKeys,
    PublicInformationForIp,
    SignedPublicKey,
    UnsignedCredentialDeploymentInformation,
    UpdateInstruction,
    AddIdentityProvider,
    ElectionDifficulty,
    BakerStakeThreshold,
    GasRewards,
    ProtocolUpdate,
    MintDistribution,
    FoundationAccount,
    TransactionFeeDistribution,
    ExchangeRate,
    HigherLevelKeyUpdate,
    AuthorizationKeysUpdate,
    UpdateInstructionPayload,
    UpdateAccountCredentials,
    AccountTransaction,
    AddAnonymityRevoker,
    BlsKeyTypes,
    TimeParameters,
    CooldownParameters,
    PoolParameters,
} from '~/utils/types';
import { AppAndVersion } from '../features/ledger/GetAppAndVersion';
import { AccountPathInput } from '../features/ledger/Path';

type ReturnBuffer = Promise<Buffer>;

type SignAccountTransaction<T> = (
    transaction: T,
    path: number[]
) => ReturnBuffer;

type SignUpdate<PayloadType extends UpdateInstructionPayload> = (
    transaction: UpdateInstruction<PayloadType>,
    serializedPayload: Buffer,
    keypath: number[]
) => ReturnBuffer;

type SignKeyUpdate<PayloadType extends UpdateInstructionPayload> = (
    transaction: UpdateInstruction<PayloadType>,
    serializedPayload: Buffer,
    keypath: number[],
    INS: number
) => ReturnBuffer;

type LedgerCommands = {
    getPublicKey: (keypath: number[]) => Promise<Buffer>;
    getPublicKeySilent: (keypath: number[]) => ReturnBuffer;
    getSignedPublicKey: (keypath: number[]) => Promise<SignedPublicKey>;
    verifyAddress: (
        identity: number,
        credentialNumber: number
    ) => Promise<void>;
    getPrivateKeys: (
        identity: number,
        keyType: BlsKeyTypes
    ) => Promise<PrivateKeys>;
    getPrfKeyDecrypt: (identity: number, keyType: BlsKeyTypes) => ReturnBuffer;
    getPrfKeyRecovery: (identity: number) => ReturnBuffer;
    signTransfer: SignAccountTransaction<AccountTransaction>;
    signPublicInformationForIp: (
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ) => ReturnBuffer;
    signUpdateCredentialTransaction: SignAccountTransaction<UpdateAccountCredentials>;
    signCredentialDeploymentOnExistingAccount: (
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        keypath: number[]
    ) => ReturnBuffer;
    signCredentialDeploymentOnNewAccount: (
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        keypath: number[]
    ) => ReturnBuffer;
    signMicroGtuPerEuro: SignUpdate<ExchangeRate>;
    signEuroPerEnergy: SignUpdate<ExchangeRate>;
    signTransactionFeeDistribution: SignUpdate<TransactionFeeDistribution>;
    signFoundationAccount: SignUpdate<FoundationAccount>;
    signMintDistribution: SignUpdate<MintDistribution>;
    signProtocolUpdate: SignUpdate<ProtocolUpdate>;
    signGasRewards: SignUpdate<GasRewards>;
    signBakerStakeThreshold: SignUpdate<BakerStakeThreshold>;
    signElectionDifficulty: SignUpdate<ElectionDifficulty>;
    signAddIdentityProvider: SignUpdate<AddIdentityProvider>;
    signAddAnonymityRevoker: SignUpdate<AddAnonymityRevoker>;
    signTimeParameters: SignUpdate<TimeParameters>;
    signCooldownParameters: SignUpdate<CooldownParameters>;
    signPoolParameters: SignUpdate<PoolParameters>;
    signHigherLevelKeysUpdate: SignKeyUpdate<HigherLevelKeyUpdate>;
    signAuthorizationKeysUpdate: SignKeyUpdate<AuthorizationKeysUpdate>;
    getAppAndVersion: () => Promise<AppAndVersion>;
    subscribe: () => Promise<void>;
    closeTransport: () => void;
    resetTransport: () => Promise<void>;
};

export default LedgerCommands;
