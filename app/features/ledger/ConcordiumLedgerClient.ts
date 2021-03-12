import type Transport from '@ledgerhq/hw-transport';
import {
    getPublicKey,
    getPublicKeySilent,
    getSignedPublicKey,
} from './GetPublicKey';
import signTransfer from './Transfer';
import signPublicInformationForIp from './PublicInformationForIp';
import { getIdCredSec, getPrfKey } from './ExportPrivateKeySeed';
import {
    signNewCredentialDeployment,
    signExistingCredentialDeployment,
} from './CredentialDeployment';
import {
    AccountTransaction,
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
    UpdateAccountCredentials,
} from '../../utils/types';
import { AccountPathInput, getAccountPath } from './Path';
import getAppAndVersion, { AppAndVersion } from './GetAppAndVersion';
import signUpdateTransaction from './SignUpdateTransaction';
import signUpdateProtocolTransaction from './SignProtocolUpdate';
import signUpdateCredentialTransaction from './SignUpdateCredentials';
/**
 * Concordium Ledger API.
 *
 * @example
 * import ConcordiumLedgerClient from "..."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClient {
    transport: Transport;

    constructor(transport: Transport) {
        this.transport = transport;

        transport.decorateAppAPIMethods(
            this,
            [
                'getPublicKey',
                'getIdCredSec',
                'getPrfKey',
                'signTransfer',
                'signAccountChallenge',
            ],
            'GTU'
        );
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

    getIdCredSec(identity: number): Promise<Buffer> {
        return getIdCredSec(this.transport, identity);
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
            transaction
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

    signExistingCredentialDeployment(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        path: number[]
    ): Promise<Buffer> {
        return signExistingCredentialDeployment(
            this.transport,
            credentialDeployment,
            address,
            path
        );
    }

    signNewCredentialDeployment(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        path: number[]
    ): Promise<Buffer> {
        return signNewCredentialDeployment(
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

    getAppAndVersion(): Promise<AppAndVersion> {
        return getAppAndVersion(this.transport);
    }
}
