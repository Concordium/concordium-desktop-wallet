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
    PublicInformationForIp,
    TransactionFeeDistribution,
    UpdateInstruction,
} from '../../utils/types';
import { AccountPathInput, getAccountPath } from './Path';
import signUpdateMicroGtuPerEuro from './MicroGtuPerEuro';
import getAppAndVersion, { AppAndVersion } from './GetAppAndVersion';
import signUpdateEuroPerEnergy from './EuroPerEnergy';
import signUpdateTransactionFeeDistribution from './TransactionFeeDistribution';
import signUpdateFoundationAccount from './FoundationAccount';

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
        return signUpdateMicroGtuPerEuro(
            this.transport,
            path,
            serializedPayload,
            transaction
        );
    }

    signEuroPerEnergy(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return signUpdateEuroPerEnergy(
            this.transport,
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
        return signUpdateTransactionFeeDistribution(
            this.transport,
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
        return signUpdateFoundationAccount(
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
