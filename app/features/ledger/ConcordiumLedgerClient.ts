/* eslint no-console: off */
import { Buffer } from 'buffer/';
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
import { stringify } from '~/utils/JSONHelper';
import { LedgerIpcMessage } from './ConcordiumLedgerClientMain';

function unwrapLedgerIpcMessage(message: LedgerIpcMessage<Buffer>): Buffer {
    if (message.error) {
        throw message.error;
    }
    if (!message.result) {
        throw new Error('Missing result');
    }
    return Buffer.from(message.result);
}

/**
 * Concordium Ledger API that can be used, safely, from a renderer thread.
 *
 * @example
 * import ConcordiumLedgerClient from "..."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClient {
    async getPublicKey(path: number[]): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getPublicKey,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async getPublicKeySilent(path: number[]): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getPublicKeySilent,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async getSignedPublicKey(path: number[]): Promise<SignedPublicKey> {
        const result: LedgerIpcMessage<SignedPublicKey> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getSignedPublicKey,
            path
        );

        if (result.error) {
            throw result.error;
        }

        if (!result.result) {
            throw new Error('Missing result');
        }

        return result.result;
    }

    async getIdCredSec(identity: number): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getIdCredSec,
            identity
        );
        return unwrapLedgerIpcMessage(result);
    }

    async getPrfKey(identity: number): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getPrfKey,
            identity
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signTransfer(
        transaction: AccountTransaction,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signTransfer,
            stringify(transaction),
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signUpdateCredentialTransaction(
        transaction: UpdateAccountCredentials,
        path: number[],
        onAwaitVerificationKeyConfirmation: (key: Hex) => void,
        onVerificationKeysConfirmed: () => void
    ): Promise<Buffer> {
        window.ipcRenderer.once(
            ledgerIpcCommands.onAwaitVerificationKey,
            (_event, key) => onAwaitVerificationKeyConfirmation(key)
        );
        window.ipcRenderer.once(
            ledgerIpcCommands.onVerificationKeysConfirmed,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_event) => onVerificationKeysConfirmed()
        );

        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signUpdateCredentialTransaction,
            stringify(transaction),
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signPublicInformationForIp(
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signPublicInformationForIp,
            publicInfoForIp,
            accountPathInput
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signCredentialDeploymentOnExistingAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signCredentialDeploymentOnExistingAccount,
            credentialDeployment,
            address,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signCredentialDeploymentOnNewAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signCredentialDeploymentOnNewAccount,
            credentialDeployment,
            stringify(expiry),
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signMicroGtuPerEuro(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signMicroGtuPerEuro,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signEuroPerEnergy(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signEuroPerEnergy,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signTransactionFeeDistribution(
        transaction: UpdateInstruction<TransactionFeeDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signTransactionFeeDistribution,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signFoundationAccount(
        transaction: UpdateInstruction<FoundationAccount>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signFoundationAccount,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signMintDistribution(
        transaction: UpdateInstruction<MintDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signMintDistribution,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signProtocolUpdate(
        transaction: UpdateInstruction<ProtocolUpdate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signProtocolUpdate,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signGasRewards(
        transaction: UpdateInstruction<GasRewards>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signGasRewards,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signBakerStakeThreshold(
        transaction: UpdateInstruction<BakerStakeThreshold>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signBakerStakeThreshold,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signElectionDifficulty(
        transaction: UpdateInstruction<ElectionDifficulty>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signElectionDifficulty,
            transaction,
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signHigherLevelKeysUpdate(
        transaction: UpdateInstruction<HigherLevelKeyUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signHigherLevelKeysUpdate,
            transaction,
            serializedPayload,
            path,
            INS
        );
        return unwrapLedgerIpcMessage(result);
    }

    async signAuthorizationKeysUpdate(
        transaction: UpdateInstruction<AuthorizationKeysUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<Buffer> {
        const result = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signAuthorizationKeysUpdate,
            transaction,
            serializedPayload,
            path,
            INS
        );
        return unwrapLedgerIpcMessage(result);
    }

    getAppAndVersion(): Promise<AppAndVersion> {
        return window.ipcRenderer.invoke(ledgerIpcCommands.getAppAndVersion);
    }
}
