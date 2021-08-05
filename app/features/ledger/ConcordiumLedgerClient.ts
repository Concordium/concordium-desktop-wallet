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
    TransactionFeeDistribution,
    UpdateInstruction,
    UnsignedCredentialDeploymentInformation,
    HigherLevelKeyUpdate,
    UpdateAccountCredentials,
    AuthorizationKeysUpdate,
    Hex,
} from '~/utils/types';
import { stringify } from '~/utils/JSONHelper';

/**
 * Concordium Ledger API that can be used, safely, from a renderer thread.
 *
 * @example
 * import ConcordiumLedgerClient from ".."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClient {
    getPublicKey = window.ledger.getPublicKey;

    getPublicKeySilent = window.ledger.getPublicKeySilent;

    getSignedPublicKey = window.ledger.getSignedPublicKey;

    getIdCredSec = window.ledger.getIdCredSec;

    getPrfKey = window.ledger.getPrfKey;

    signPublicInformationForIp = window.ledger.signPublicInformationForIp;

    signCredentialDeploymentOnExistingAccount =
        window.ledger.signCredentialDeploymentOnExistingAccount;

    getAppAndVersion = window.ledger.getAppAndVersion;

    signTransfer(
        transaction: AccountTransaction,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signTransfer(stringify(transaction), path);
    }

    signUpdateCredentialTransaction(
        transaction: UpdateAccountCredentials,
        path: number[],
        onAwaitVerificationKeyConfirmation: (key: Hex) => void,
        onVerificationKeysConfirmed: () => void
    ): Promise<Buffer> {
        window.once.onAwaitVerificationKey(onAwaitVerificationKeyConfirmation);
        window.once.onVerificationKeysConfirmed(onVerificationKeysConfirmed);
        return window.ledger.signUpdateCredentialTransaction(
            stringify(transaction),
            path
        );
    }

    signCredentialDeploymentOnNewAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signCredentialDeploymentOnNewAccount(
            credentialDeployment,
            stringify(expiry),
            path
        );
    }

    signMicroGtuPerEuro(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signMicroGtuPerEuro(
            stringify(transaction),
            serializedPayload,
            path
        );
    }

    signEuroPerEnergy(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signEuroPerEnergy(
            stringify(transaction),
            serializedPayload,
            path
        );
    }

    signTransactionFeeDistribution(
        transaction: UpdateInstruction<TransactionFeeDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signTransactionFeeDistribution(
            stringify(transaction),
            serializedPayload,
            path
        );
    }

    signFoundationAccount(
        transaction: UpdateInstruction<FoundationAccount>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signFoundationAccount(
            stringify(transaction),
            serializedPayload,
            path
        );
    }

    signMintDistribution(
        transaction: UpdateInstruction<MintDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signMintDistribution(
            stringify(transaction),
            serializedPayload,
            path
        );
    }

    signProtocolUpdate(
        transaction: UpdateInstruction<ProtocolUpdate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signProtocolUpdate(
            stringify(transaction),
            serializedPayload,
            path
        );
    }

    signGasRewards(
        transaction: UpdateInstruction<GasRewards>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signGasRewards(
            stringify(transaction),
            serializedPayload,
            path
        );
    }

    signBakerStakeThreshold(
        transaction: UpdateInstruction<BakerStakeThreshold>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signBakerStakeThreshold(
            stringify(transaction),
            serializedPayload,
            path
        );
    }

    signElectionDifficulty(
        transaction: UpdateInstruction<ElectionDifficulty>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return window.ledger.signElectionDifficulty(
            stringify(transaction),
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
        return window.ledger.signHigherLevelKeysUpdate(
            stringify(transaction),
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
        return window.ledger.signAuthorizationKeysUpdate(
            stringify(transaction),
            serializedPayload,
            path,
            INS
        );
    }
}
