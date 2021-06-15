/* eslint no-console: off */
import type { Buffer } from 'buffer/';
import {
    AccountTransaction,
    BakerStakeThreshold,
    ElectionDifficulty,
    ExchangeRate,
    FoundationAccount,
    GasRewards,
    MintDistribution,
    ProtocolUpdate,
    PublicInformationForIp,
    SignedPublicKey,
    TransactionFeeDistribution,
    UpdateInstruction,
    UnsignedCredentialDeploymentInformation,
    HigherLevelKeyUpdate,
    UpdateAccountCredentials,
    AuthorizationKeysUpdate,
    Hex,
} from '~/utils/types';
import { AccountPathInput } from './Path';
import { AppAndVersion } from './GetAppAndVersion';
import ledgerIpcCommands from '../../constants/ledgerIpcCommands.json';

/**
 * Concordium Ledger API.
 *
 * @example
 * import ConcordiumLedgerClient from "..."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClient {
    getPublicKey(path: number[]): Promise<Buffer> {
        return window.ipcRenderer.invoke(ledgerIpcCommands.getPublicKey, path);
    }

    getPublicKeySilent(path: number[]): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.getPublicKeySilent,
            path
        );
    }

    getSignedPublicKey(path: number[]): Promise<SignedPublicKey> {
        console.log('Get signed key');
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.getSignedPublicKey,
            path
        );
    }

    getIdCredSec(identity: number): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.getIdCredSec,
            identity
        );
    }

    getPrfKey(identity: number): Promise<Buffer> {
        return window.ipcRenderer.invoke(ledgerIpcCommands.getPrfKey, identity);
    }

    signTransfer(
        transaction: AccountTransaction,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signTransfer,
            transaction,
            path
        );
    }

    // TODO Fix this by sending messages back to the renderer thread instead.
    signUpdateCredentialTransaction(
        transaction: UpdateAccountCredentials,
        path: number[],
        onAwaitVerificationKeyConfirmation: (key: Hex) => void,
        onVerificationKeysConfirmed: () => void
    ): Promise<Buffer> {
        console.log(transaction);
        console.log(path);
        console.log(onAwaitVerificationKeyConfirmation('test'));
        console.log(onVerificationKeysConfirmed());
        throw new Error('Testing');
    }

    signPublicInformationForIp(
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signTransfer,
            publicInfoForIp,
            accountPathInput
        );
    }

    signCredentialDeploymentOnExistingAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signCredentialDeploymentOnExistingAccount,
            credentialDeployment,
            address,
            path
        );
    }

    signCredentialDeploymentOnNewAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signCredentialDeploymentOnNewAccount,
            credentialDeployment,
            expiry,
            path
        );
    }

    signMicroGtuPerEuro(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signMicroGtuPerEuro,
            transaction,
            serializedPayload,
            path
        );
    }

    signEuroPerEnergy(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signEuroPerEnergy,
            transaction,
            serializedPayload,
            path
        );
    }

    signTransactionFeeDistribution(
        transaction: UpdateInstruction<TransactionFeeDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signTransactionFeeDistribution,
            transaction,
            serializedPayload,
            path
        );
    }

    signFoundationAccount(
        transaction: UpdateInstruction<FoundationAccount>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signFoundationAccount,
            transaction,
            serializedPayload,
            path
        );
    }

    signMintDistribution(
        transaction: UpdateInstruction<MintDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signMintDistribution,
            transaction,
            serializedPayload,
            path
        );
    }

    signProtocolUpdate(
        transaction: UpdateInstruction<ProtocolUpdate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signProtocolUpdate,
            transaction,
            serializedPayload,
            path
        );
    }

    signGasRewards(
        transaction: UpdateInstruction<GasRewards>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signGasRewards,
            transaction,
            serializedPayload,
            path
        );
    }

    signBakerStakeThreshold(
        transaction: UpdateInstruction<BakerStakeThreshold>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signBakerStakeThreshold,
            transaction,
            serializedPayload,
            path
        );
    }

    signElectionDifficulty(
        transaction: UpdateInstruction<ElectionDifficulty>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signElectionDifficulty,
            transaction,
            serializedPayload,
            path
        );
    }

    signHigherLevelKeysUpdate(
        transaction: UpdateInstruction<HigherLevelKeyUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signHigherLevelKeysUpdate,
            transaction,
            serializedPayload,
            path,
            INS
        );
    }

    signAuthorizationKeysUpdate(
        transaction: UpdateInstruction<AuthorizationKeysUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<Buffer> {
        return window.ipcRenderer.invoke(
            ledgerIpcCommands.signAuthorizationKeysUpdate,
            transaction,
            serializedPayload,
            path,
            INS
        );
    }

    getAppAndVersion(): Promise<AppAndVersion> {
        return window.ipcRenderer.invoke(ledgerIpcCommands.getAppAndVersion);
    }
}
