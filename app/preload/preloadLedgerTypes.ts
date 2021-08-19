import { Buffer } from 'buffer/';
import {
    PrivateKeySeeds,
    PublicInformationForIp,
    SignedPublicKey,
    UnsignedCredentialDeploymentInformation,
} from '~/utils/types';
import { AppAndVersion } from '../features/ledger/GetAppAndVersion';
import { AccountPathInput } from '../features/ledger/Path';

type ReturnBuffer = Promise<Buffer>;

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
    getPublicKey: (keypath: number[]) => Promise<Buffer>;
    getPublicKeySilent: (keypath: number[]) => ReturnBuffer;
    getSignedPublicKey: (keypath: number[]) => Promise<SignedPublicKey>;
    getPrivateKeySeeds: (identity: number) => Promise<PrivateKeySeeds>;
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
    getAppAndVersion: () => Promise<AppAndVersion>;
    subscribe: () => Promise<void>;
    closeTransport: () => void;
};

export default LedgerCommands;
