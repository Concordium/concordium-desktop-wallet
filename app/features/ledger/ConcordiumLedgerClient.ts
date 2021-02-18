import type Transport from '@ledgerhq/hw-transport';
import getPublicKey from './GetPublicKey';
import signTransfer from './Transfer';
import signPublicInformationForIp from './PublicInformationForIp';
import { getIdCredSec, getPrfKey } from './ExportPrivateKeySeed';
import signAccountChallenge from './AccountChallenge';
import {
    AccountTransaction,
    ExchangeRate,
    FoundationAccount,
    MintDistribution,
    ProtocolUpdate,
    PublicInformationForIp,
    TransactionFeeDistribution,
    UpdateInstruction,
} from '../../utils/types';
import { AccountPathInput, getAccountPath } from './Path';
import getAppAndVersion, { AppAndVersion } from './GetAppAndVersion';
import signUpdateTransaction from './SignUpdateTransaction';
import signUpdateProtocolTransaction from './SignProtocolUpdate';

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

    getPublicKey(path: number[]): Promise<Buffer> {
        return getPublicKey(this.transport, path);
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

    signAccountChallenge(challenge: Buffer, path: number[]): Promise<Buffer> {
        return signAccountChallenge(this.transport, path, challenge);
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

    getAppAndVersion(): Promise<AppAndVersion> {
        return getAppAndVersion(this.transport);
    }
}
