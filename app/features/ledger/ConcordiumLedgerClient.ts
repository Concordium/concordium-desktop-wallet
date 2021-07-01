import { Buffer } from 'buffer/';
import { deserializeError } from 'serialize-error';
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

function unwrapLedgerIpcMessage<T>(
    message: LedgerIpcMessage<T>,
    callOnResult?: (input: T) => T
): T {
    if (message.error) {
        throw deserializeError(message.error);
    }
    if (!message.result) {
        throw new Error('Missing result');
    }

    if (callOnResult) {
        return callOnResult(message.result);
    }
    return message.result;
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
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getPublicKey,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async getPublicKeySilent(path: number[]): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getPublicKeySilent,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async getSignedPublicKey(path: number[]): Promise<SignedPublicKey> {
        const result: LedgerIpcMessage<SignedPublicKey> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getSignedPublicKey,
            path
        );
        return unwrapLedgerIpcMessage(result);
    }

    async getIdCredSec(identity: number): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getIdCredSec,
            identity
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async getPrfKey(identity: number): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getPrfKey,
            identity
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signTransfer(
        transaction: AccountTransaction,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signTransfer,
            stringify(transaction),
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
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

        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signUpdateCredentialTransaction,
            stringify(transaction),
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signPublicInformationForIp(
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signPublicInformationForIp,
            publicInfoForIp,
            accountPathInput
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signCredentialDeploymentOnExistingAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signCredentialDeploymentOnExistingAccount,
            credentialDeployment,
            address,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signCredentialDeploymentOnNewAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signCredentialDeploymentOnNewAccount,
            credentialDeployment,
            stringify(expiry),
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signMicroGtuPerEuro(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signMicroGtuPerEuro,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signEuroPerEnergy(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signEuroPerEnergy,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signTransactionFeeDistribution(
        transaction: UpdateInstruction<TransactionFeeDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signTransactionFeeDistribution,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signFoundationAccount(
        transaction: UpdateInstruction<FoundationAccount>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signFoundationAccount,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signMintDistribution(
        transaction: UpdateInstruction<MintDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signMintDistribution,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signProtocolUpdate(
        transaction: UpdateInstruction<ProtocolUpdate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signProtocolUpdate,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signGasRewards(
        transaction: UpdateInstruction<GasRewards>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signGasRewards,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signBakerStakeThreshold(
        transaction: UpdateInstruction<BakerStakeThreshold>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signBakerStakeThreshold,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signElectionDifficulty(
        transaction: UpdateInstruction<ElectionDifficulty>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signElectionDifficulty,
            stringify(transaction),
            serializedPayload,
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signHigherLevelKeysUpdate(
        transaction: UpdateInstruction<HigherLevelKeyUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signHigherLevelKeysUpdate,
            stringify(transaction),
            serializedPayload,
            path,
            INS
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signAuthorizationKeysUpdate(
        transaction: UpdateInstruction<AuthorizationKeysUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<Buffer> {
        const result: LedgerIpcMessage<Buffer> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.signAuthorizationKeysUpdate,
            stringify(transaction),
            serializedPayload,
            path,
            INS
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async getAppAndVersion(): Promise<AppAndVersion> {
        const result: LedgerIpcMessage<AppAndVersion> = await window.ipcRenderer.invoke(
            ledgerIpcCommands.getAppAndVersion
        );
        return unwrapLedgerIpcMessage(result);
    }
}
