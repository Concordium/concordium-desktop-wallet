import { Buffer } from 'buffer/';
import {
    PublicInformationForIp,
    SignedPublicKey,
    UnsignedCredentialDeploymentInformation,
} from '~/utils/types';
import { LedgerIpcMessage } from './features/ledger/ConcordiumLedgerClientMain';
import { AppAndVersion } from './features/ledger/GetAppAndVersion';
import { AccountPathInput } from './features/ledger/Path';

type ReturnBuffer = Promise<LedgerIpcMessage<Buffer>>;

type SignUpdate = (
    transactionAsJson: string,
    serializedPayload: Buffer,
    keypath: number[]
) => ReturnBuffer;

type SignKeyUpdate = (
    transactionAsJson: string,
    serializedPayload: Buffer,
    keypath: number[],
    INS: number
) => ReturnBuffer;

type LedgerCommands = {
    getPublicKey: (keypath: number[]) => ReturnBuffer;
    getPublicKeySilent: (keypath: number[]) => ReturnBuffer;
    getSignedPublicKey: (
        keypath: number[]
    ) => Promise<LedgerIpcMessage<SignedPublicKey>>;
    getIdCredSec: (identity: number) => ReturnBuffer;
    getPrfKey: (identity: number) => ReturnBuffer;
    signTransfer: (
        transactionAsJson: string,
        keypath: number[]
    ) => ReturnBuffer;
    signPublicInformationForIp: (
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ) => ReturnBuffer;
    signUpdateCredentialTransaction: (
        transactionAsJson: string,
        path: number[]
    ) => ReturnBuffer;
    signCredentialDeploymentOnExistingAccount: (
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        keypath: number[]
    ) => ReturnBuffer;
    signCredentialDeploymentOnNewAccount: (
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: string,
        keypath: number[]
    ) => ReturnBuffer;
    signMicroGtuPerEuro: SignUpdate;
    signEuroPerEnergy: SignUpdate;
    signTransactionFeeDistribution: SignUpdate;
    signFoundationAccount: SignUpdate;
    signMintDistribution: SignUpdate;
    signProtocolUpdate: SignUpdate;
    signGasRewards: SignUpdate;
    signBakerStakeThreshold: SignUpdate;
    signElectionDifficulty: SignUpdate;
    signHigherLevelKeysUpdate: SignKeyUpdate;
    signAuthorizationKeysUpdate: SignKeyUpdate;
    getAppAndVersion: () => Promise<LedgerIpcMessage<AppAndVersion>>;
    subscribe: () => Promise<void>;
    closeTransport: () => void;
};

export default LedgerCommands;
