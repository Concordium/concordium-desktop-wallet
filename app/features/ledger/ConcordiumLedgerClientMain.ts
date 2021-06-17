/* eslint-disable @typescript-eslint/no-explicit-any */
import type HwTransport from '@ledgerhq/hw-transport';
import { Buffer } from 'buffer/';
import { Transport, TransportImpl } from './Transport';
import {
    getPublicKey,
    getPublicKeySilent,
    getSignedPublicKey,
} from './GetPublicKey';
import signTransfer from './Transfer';
import signPublicInformationForIp from './PublicInformationForIp';
import { getIdCredSec, getPrfKey } from './ExportPrivateKeySeed';
import {
    signCredentialDeploymentOnNewAccount,
    signCredentialDeploymentOnExistingAccount,
} from './CredentialDeployment';
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
import { AccountPathInput, getAccountPath } from './Path';
import getAppAndVersion, { AppAndVersion } from './GetAppAndVersion';
import signUpdateTransaction from './SignUpdateTransaction';
import signUpdateProtocolTransaction from './SignProtocolUpdate';
import signHigherLevelKeyUpdate from './SignHigherLevelKeyUpdate';
import signUpdateCredentialTransaction from './SignUpdateCredentials';
import signAuthorizationKeysUpdate from './SignAuthorizationKeysUpdate';

export interface LedgerIpcMessage {
    result?: Buffer;
    error?: any;
}

async function wrapResult(
    call: (...input: any[]) => Promise<Buffer>,
    ...args: any[]
): Promise<LedgerIpcMessage> {
    try {
        const result: LedgerIpcMessage = {
            result: await call(...args),
        };
        return result;
    } catch (e) {
        const error: LedgerIpcMessage = {
            error: e,
        };
        return error;
    }
}

/**
 * Concordium Ledger API.
 *
 * This MUST be called from the main thread.
 *
 * @example
 * import ConcordiumLedgerClient from "..."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClientMain {
    transport: Transport;

    constructor(transport: HwTransport) {
        this.transport = new TransportImpl(transport);
    }

    closeTransport(): Promise<void> {
        return this.transport.close();
    }

    getPublicKey(path: number[]): Promise<LedgerIpcMessage> {
        return wrapResult(getPublicKey, this.transport, path);
    }

    getPublicKeySilent(path: number[]): Promise<LedgerIpcMessage> {
        return wrapResult(getPublicKeySilent, this.transport, path);
    }

    getSignedPublicKey(path: number[]): Promise<SignedPublicKey> {
        // TODO Update this.
        return getSignedPublicKey(this.transport, path);
    }

    getIdCredSec(identity: number): Promise<LedgerIpcMessage> {
        return wrapResult(getIdCredSec, this.transport, identity);
    }

    getPrfKey(identity: number): Promise<LedgerIpcMessage> {
        return wrapResult(getPrfKey, this.transport, identity);
    }

    signTransfer(
        transaction: AccountTransaction,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(signTransfer, this.transport, path, transaction);
    }

    signUpdateCredentialTransaction(
        transaction: UpdateAccountCredentials,
        path: number[],
        onAwaitVerificationKeyConfirmation: (key: Hex) => void,
        onVerificationKeysConfirmed: () => void
    ): Promise<Buffer> {
        return signUpdateCredentialTransaction(
            this.transport,
            path,
            transaction,
            onAwaitVerificationKeyConfirmation,
            onVerificationKeysConfirmed
        );
    }

    signPublicInformationForIp(
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ): Promise<LedgerIpcMessage> {
        const accountPath = getAccountPath(accountPathInput);
        return wrapResult(
            signPublicInformationForIp,
            this.transport,
            accountPath,
            publicInfoForIp
        );
    }

    signCredentialDeploymentOnExistingAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signCredentialDeploymentOnExistingAccount,
            this.transport,
            credentialDeployment,
            address,
            path
        );
    }

    signCredentialDeploymentOnNewAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signCredentialDeploymentOnNewAccount,
            this.transport,
            credentialDeployment,
            expiry,
            path
        );
    }

    signMicroGtuPerEuro(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateTransaction,
            this.transport,
            0x06,
            path,
            transaction,
            serializedPayload
        );
    }

    signEuroPerEnergy(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateTransaction,
            this.transport,
            0x06,
            path,
            transaction,
            serializedPayload
        );
    }

    signTransactionFeeDistribution(
        transaction: UpdateInstruction<TransactionFeeDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateTransaction,
            this.transport,
            0x22,
            path,
            transaction,
            serializedPayload
        );
    }

    signFoundationAccount(
        transaction: UpdateInstruction<FoundationAccount>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateTransaction,
            this.transport,
            0x24,
            path,
            transaction,
            serializedPayload
        );
    }

    signMintDistribution(
        transaction: UpdateInstruction<MintDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateTransaction,
            this.transport,
            0x25,
            path,
            transaction,
            serializedPayload
        );
    }

    signProtocolUpdate(
        transaction: UpdateInstruction<ProtocolUpdate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateProtocolTransaction,
            this.transport,
            path,
            transaction,
            serializedPayload
        );
    }

    signGasRewards(
        transaction: UpdateInstruction<GasRewards>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateTransaction,
            this.transport,
            0x23,
            path,
            transaction,
            serializedPayload
        );
    }

    signBakerStakeThreshold(
        transaction: UpdateInstruction<BakerStakeThreshold>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateTransaction,
            this.transport,
            0x27,
            path,
            transaction,
            serializedPayload
        );
    }

    signElectionDifficulty(
        transaction: UpdateInstruction<ElectionDifficulty>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signUpdateTransaction,
            this.transport,
            0x26,
            path,
            transaction,
            serializedPayload
        );
    }

    signHigherLevelKeysUpdate(
        transaction: UpdateInstruction<HigherLevelKeyUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signHigherLevelKeyUpdate,
            this.transport,
            path,
            transaction,
            serializedPayload,
            INS
        );
    }

    signAuthorizationKeysUpdate(
        transaction: UpdateInstruction<AuthorizationKeysUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<LedgerIpcMessage> {
        return wrapResult(
            signAuthorizationKeysUpdate,
            this.transport,
            path,
            transaction,
            serializedPayload,
            INS
        );
    }

    getAppAndVersion(): Promise<AppAndVersion> {
        return getAppAndVersion(this.transport);
    }
}
