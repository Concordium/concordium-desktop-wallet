import { ValidatorScoreParameters } from '@concordium/web-sdk';
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
import { getPrfKeyDecrypt, getPrfKeyRecovery } from './ExportPrivateKeySeed';
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
    AddIdentityProvider,
    AddAnonymityRevoker,
    PrivateKeys,
    BlsKeyTypes,
    TimeParameters,
    CooldownParameters,
    PoolParameters,
    BlockEnergyLimit,
    FinalizationCommitteeParameters,
    MinBlockTime,
    TimeoutParameters,
} from '~/utils/types';
import { AccountPathInput, getAccountPath } from './Path';
import getAppAndVersion, { AppAndVersion } from './GetAppAndVersion';
import signUpdateTransaction from './SignUpdateTransaction';
import signUpdateProtocolTransaction from './SignProtocolUpdate';
import signHigherLevelKeyUpdate from './SignHigherLevelKeyUpdate';
import signUpdateCredentialTransaction from './SignUpdateCredentials';
import signAuthorizationKeysUpdate from './SignAuthorizationKeysUpdate';
import signAddIdentityProviderTransaction from './SignAddIdentityProvider';
import signAddAnonymityRevokerTransaction from './SignAddAnonymityRevoker';
import signPoolParameters from './SignPoolParameters';
import EmulatorTransport from './EmulatorTransport';
import verifyAddress from './verifyAddress';
import AppConcordium from '@blooo/hw-app-concordium';
import { ExportType, Mode } from '@blooo/hw-app-concordium/lib/type';

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

    /** Undefined when using the emulator at the moment. */
    app?: AppConcordium;

    constructor(eventEmitter: EventEmitter, transport?: HwTransport) {
        if (transport) {
            this.transport = new TransportImpl(transport);
            this.app = new AppConcordium(transport);
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

    async getPrivateKeys(
        identity: number,
        keyType: BlsKeyTypes
    ): Promise<PrivateKeys> {
        if (this.app === undefined) {
            throw new Error('Not implemented for the emulator');
        }
        let exportType;
        switch (keyType) {
            case BlsKeyTypes.Key:
                exportType = ExportType.PRF_KEY;
                break;
            case BlsKeyTypes.Seed:
                exportType = ExportType.PRF_KEY_SEED;
                break;
        }
        // Dummy value since this is not used by legacy path
        const identityProvider = 0;
        const result = await this.app.exportPrivateKey(
            { identity, identityProvider },
            exportType,
            Mode.EXPORT_CRED_ID,
            true
        );
        return {
            idCredSec: Buffer.from(result.credentialId!, 'hex'),
            prfKey: Buffer.from(result.privateKey, 'hex'),
        };
    }

    getPrfKeyDecrypt(identity: number, keyType: BlsKeyTypes): Promise<Buffer> {
        return getPrfKeyDecrypt(this.transport, identity, keyType);
    }

    getPrfKeyRecovery(identity: number): Promise<Buffer> {
        return getPrfKeyRecovery(this.transport, identity);
    }

    verifyAddress(identity: number, credentialNumber: number): Promise<void> {
        return verifyAddress(this.transport, identity, credentialNumber);
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
        version: number,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateTransaction(
            this.transport,
            0x25,
            path,
            transaction,
            serializedPayload,
            version
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

    signCooldownParameters(
        transaction: UpdateInstruction<CooldownParameters>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateTransaction(
            this.transport,
            0x40,
            path,
            transaction,
            serializedPayload
        );
    }

    signPoolParameters(
        transaction: UpdateInstruction<PoolParameters>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signPoolParameters(
            this.transport,
            path,
            transaction,
            serializedPayload
        );
    }

    signTimeParameters(
        transaction: UpdateInstruction<TimeParameters>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateTransaction(
            this.transport,
            0x42,
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
        INS: number,
        version: number
    ): Promise<Buffer> {
        return signAuthorizationKeysUpdate(
            this.transport,
            path,
            transaction,
            serializedPayload,
            INS,
            version
        );
    }

    signAddIdentityProvider(
        transaction: UpdateInstruction<AddIdentityProvider>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signAddIdentityProviderTransaction(
            this.transport,
            path,
            transaction,
            serializedPayload
        );
    }

    signAddAnonymityRevoker(
        transaction: UpdateInstruction<AddAnonymityRevoker>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signAddAnonymityRevokerTransaction(
            this.transport,
            path,
            transaction,
            serializedPayload
        );
    }

    signBlockEnergyLimit(
        transaction: UpdateInstruction<BlockEnergyLimit>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateTransaction(
            this.transport,
            0x45,
            path,
            transaction,
            serializedPayload
        );
    }

    signFinalizationCommitteeParameters(
        transaction: UpdateInstruction<FinalizationCommitteeParameters>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateTransaction(
            this.transport,
            0x46,
            path,
            transaction,
            serializedPayload
        );
    }

    signValidatorScoreParameters(
        transaction: UpdateInstruction<ValidatorScoreParameters>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateTransaction(
            this.transport,
            0x47,
            path,
            transaction,
            serializedPayload
        );
    }

    signMinBlockTime(
        transaction: UpdateInstruction<MinBlockTime>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateTransaction(
            this.transport,
            0x44,
            path,
            transaction,
            serializedPayload
        );
    }

    signTimeoutParameters(
        transaction: UpdateInstruction<TimeoutParameters>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateTransaction(
            this.transport,
            0x43,
            path,
            transaction,
            serializedPayload
        );
    }

    getAppAndVersion(): Promise<AppAndVersion> {
        return getAppAndVersion(this.transport);
    }
}
