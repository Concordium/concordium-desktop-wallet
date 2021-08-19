/* eslint-disable @typescript-eslint/no-explicit-any */
import type HwTransport from '@ledgerhq/hw-transport';
import { Buffer } from 'buffer/';
import EventEmitter from 'events';
import { Transport, TransportImpl } from './Transport';
import {
    getPublicKey,
    getPublicKeySilent,
    getSignedPublicKey,
} from './GetPublicKey';
import signTransfer from './Transfer';
import signPublicInformationForIp from './PublicInformationForIp';
import { getPrfKey, getPrivateKeySeeds } from './ExportPrivateKeySeed';
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
    PrivateKeySeeds,
} from '~/utils/types';
import { AccountPathInput, getAccountPath } from './Path';
import getAppAndVersion, { AppAndVersion } from './GetAppAndVersion';
import signUpdateTransaction from './SignUpdateTransaction';
import signUpdateProtocolTransaction from './SignProtocolUpdate';
import signHigherLevelKeyUpdate from './SignHigherLevelKeyUpdate';
import signUpdateCredentialTransaction from './SignUpdateCredentials';
import signAuthorizationKeysUpdate from './SignAuthorizationKeysUpdate';
import EmulatorTransport from './EmulatorTransport';

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

    eventEmitter: EventEmitter;

    constructor(eventEmitter: EventEmitter, transport?: HwTransport) {
        if (transport) {
            this.transport = new TransportImpl(transport);
        } else {
            // Transport for communicating with the Ledger Speculos emulator.
            // Only to be used for testing, as the emulator is not secure in any way.
            this.transport = new EmulatorTransport();
        }
        this.eventEmitter = eventEmitter;
    }

    closeTransport(): Promise<void> {
        return this.transport.close();
    }

    getPublicKey(path: number[]): Promise<Buffer> {
        return getPublicKey(this.transport, path);
    }

    getPublicKeySilent(path: number[]): Promise<Buffer> {
        return getPublicKeySilent(this.transport, path);
    }

    getSignedPublicKey(path: number[]): Promise<SignedPublicKey> {
        return getSignedPublicKey(this.transport, path);
    }

    getPrivateKeySeeds(identity: number): Promise<PrivateKeySeeds> {
        return getPrivateKeySeeds(this.transport, identity);
    }

    getPrfKey(identity: number): Promise<Buffer> {
        return getPrfKey(this.transport, identity);
    }

    signTransfer(
        transaction: AccountTransaction,
        path: number[]
    ): Promise<Buffer> {
        return signTransfer(this.transport, path, transaction);
    }

    signUpdateCredentialTransaction(
        transaction: UpdateAccountCredentials,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateCredentialTransaction(
            this.transport,
            path,
            transaction,
            this.eventEmitter
        );
    }

    signPublicInformationForIp(
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ): Promise<Buffer> {
        const accountPath = getAccountPath(accountPathInput);
        return signPublicInformationForIp(
            this.transport,
            accountPath,
            publicInfoForIp
        );
    }

    signCredentialDeploymentOnExistingAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        path: number[]
    ): Promise<Buffer> {
        return signCredentialDeploymentOnExistingAccount(
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
    ): Promise<Buffer> {
        return signCredentialDeploymentOnNewAccount(
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
    ): Promise<Buffer> {
        return signUpdateTransaction(
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
    ): Promise<Buffer> {
        return signUpdateTransaction(
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
    ): Promise<Buffer> {
        return signUpdateTransaction(
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
    ): Promise<Buffer> {
        return signUpdateTransaction(
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
    ): Promise<Buffer> {
        return signUpdateTransaction(
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
    ): Promise<Buffer> {
        return signUpdateProtocolTransaction(
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
    ): Promise<Buffer> {
        return signUpdateTransaction(
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
    ): Promise<Buffer> {
        return signUpdateTransaction(
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
    ): Promise<Buffer> {
        return signUpdateTransaction(
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
    ): Promise<Buffer> {
        return signHigherLevelKeyUpdate(
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
    ): Promise<Buffer> {
        return signAuthorizationKeysUpdate(
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
