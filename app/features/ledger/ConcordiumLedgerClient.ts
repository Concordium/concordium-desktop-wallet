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
import { stringify } from '~/utils/JSONHelper';
import { LedgerIpcMessage } from './ConcordiumLedgerClientMain';

function unwrapLedgerIpcMessage<T>(
    message: LedgerIpcMessage<T>,
    callOnResult?: (input: T) => T
): T {
    if (message.error) {
        throw JSON.parse(message.error);
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
 * import ConcordiumLedgerClient from ".."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClient {
    async getPublicKey(path: number[]): Promise<Buffer> {
        const result = await window.ledger.getPublicKey(path);
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async getPublicKeySilent(path: number[]): Promise<Buffer> {
        const result = await window.ledger.getPublicKeySilent(path);
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async getSignedPublicKey(path: number[]): Promise<SignedPublicKey> {
        const result = await window.ledger.getSignedPublicKey(path);
        return unwrapLedgerIpcMessage(result);
    }

    async getIdCredSec(identity: number): Promise<Buffer> {
        const result = await window.ledger.getIdCredSec(identity);
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async getPrfKey(identity: number): Promise<Buffer> {
        const result = await window.ledger.getPrfKey(identity);
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signTransfer(
        transaction: AccountTransaction,
        path: number[]
    ): Promise<Buffer> {
        const result = await window.ledger.signTransfer(
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
        window.once.onAwaitVerificationKey(onAwaitVerificationKeyConfirmation);
        window.once.onVerificationKeysConfirmed(onVerificationKeysConfirmed);
        const result = await window.ledger.signUpdateCredentialTransaction(
            stringify(transaction),
            path
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async signPublicInformationForIp(
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ): Promise<Buffer> {
        const result = await window.ledger.signPublicInformationForIp(
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
        const result = await window.ledger.signCredentialDeploymentOnExistingAccount(
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
        const result = await window.ledger.signCredentialDeploymentOnNewAccount(
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
        const result = await window.ledger.signMicroGtuPerEuro(
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
        const result = await window.ledger.signEuroPerEnergy(
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
        const result = await window.ledger.signTransactionFeeDistribution(
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
        const result = await window.ledger.signFoundationAccount(
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
        const result = await window.ledger.signMintDistribution(
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
        const result = await window.ledger.signProtocolUpdate(
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
        const result = await window.ledger.signGasRewards(
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
        const result = await window.ledger.signBakerStakeThreshold(
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
        const result = await window.ledger.signElectionDifficulty(
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
        const result = await window.ledger.signHigherLevelKeysUpdate(
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
        const result = await window.ledger.signAuthorizationKeysUpdate(
            stringify(transaction),
            serializedPayload,
            path,
            INS
        );
        return unwrapLedgerIpcMessage<Buffer>(result, Buffer.from);
    }

    async getAppAndVersion(): Promise<AppAndVersion> {
        const result = await window.ledger.getAppAndVersion();
        return unwrapLedgerIpcMessage(result);
    }
}
