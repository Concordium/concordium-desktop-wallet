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
    AddIdentityProvider,
} from '~/utils/types';
import { pipe } from '~/utils/basicHelpers';

async function toBuffer(promisedBuffer: Promise<Buffer>): Promise<Buffer> {
    return Buffer.from(await promisedBuffer);
}

/**
 * Concordium Ledger API that can be used, safely, from a renderer thread.
 *
 * @example
 * import ConcordiumLedgerClient from ".."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClient {
    getPublicKey = pipe(window.ledger.getPublicKey, toBuffer);

    getPublicKeySilent = pipe(window.ledger.getPublicKeySilent, toBuffer);

    getSignedPublicKey = window.ledger.getSignedPublicKey;

    getIdCredSec = pipe(window.ledger.getIdCredSec, toBuffer);

    getPrfKey = pipe(window.ledger.getPrfKey, toBuffer);

    signPublicInformationForIp = pipe(
        window.ledger.signPublicInformationForIp,
        toBuffer
    );

    signCredentialDeploymentOnExistingAccount = pipe(
        window.ledger.signCredentialDeploymentOnExistingAccount,
        toBuffer
    );

    getAppAndVersion = window.ledger.getAppAndVersion;

    signTransfer(
        transaction: AccountTransaction,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(window.ledger.signTransfer(transaction, path));
    }

    signUpdateCredentialTransaction(
        transaction: UpdateAccountCredentials,
        path: number[],
        onAwaitVerificationKeyConfirmation: (key: Hex) => void,
        onVerificationKeysConfirmed: () => void
    ): Promise<Buffer> {
        window.once.onAwaitVerificationKey(onAwaitVerificationKeyConfirmation);
        window.once.onVerificationKeysConfirmed(onVerificationKeysConfirmed);
        return toBuffer(
            window.ledger.signUpdateCredentialTransaction(transaction, path)
        );
    }

    signCredentialDeploymentOnNewAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signCredentialDeploymentOnNewAccount(
                credentialDeployment,
                expiry,
                path
            )
        );
    }

    signMicroGtuPerEuro(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signMicroGtuPerEuro(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signEuroPerEnergy(
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signEuroPerEnergy(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signTransactionFeeDistribution(
        transaction: UpdateInstruction<TransactionFeeDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signTransactionFeeDistribution(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signFoundationAccount(
        transaction: UpdateInstruction<FoundationAccount>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signFoundationAccount(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signMintDistribution(
        transaction: UpdateInstruction<MintDistribution>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signMintDistribution(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signProtocolUpdate(
        transaction: UpdateInstruction<ProtocolUpdate>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signProtocolUpdate(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signGasRewards(
        transaction: UpdateInstruction<GasRewards>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signGasRewards(transaction, serializedPayload, path)
        );
    }

    signBakerStakeThreshold(
        transaction: UpdateInstruction<BakerStakeThreshold>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signBakerStakeThreshold(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signElectionDifficulty(
        transaction: UpdateInstruction<ElectionDifficulty>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signElectionDifficulty(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signHigherLevelKeysUpdate(
        transaction: UpdateInstruction<HigherLevelKeyUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signHigherLevelKeysUpdate(
                transaction,
                serializedPayload,
                path,
                INS
            )
        );
    }

    signAddIdentityProvider(
        transaction: UpdateInstruction<AddIdentityProvider>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signAddIdentityProvider(
                transaction,
                serializedPayload,
                path
            )
        );
    }

    signAuthorizationKeysUpdate(
        transaction: UpdateInstruction<AuthorizationKeysUpdate>,
        serializedPayload: Buffer,
        path: number[],
        INS: number
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signAuthorizationKeysUpdate(
                transaction,
                serializedPayload,
                path,
                INS
            )
        );
    }
}
