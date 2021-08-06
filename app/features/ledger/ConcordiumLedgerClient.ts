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

async function toBuffer(promisedBuffer: Promise<Buffer>): Promise<Buffer> {
    return Buffer.from(await promisedBuffer);
}

function pipe<A extends any[], B, C>(
    a: (...args: A) => B,
    b: (arg: B) => C
): (...args: A) => C {
    return (...args) => b(a(...args));
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
        return toBuffer(
            window.ledger.signTransfer(stringify(transaction), path)
        );
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
            window.ledger.signUpdateCredentialTransaction(
                stringify(transaction),
                path
            )
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
                stringify(expiry),
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
                stringify(transaction),
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
                stringify(transaction),
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
                stringify(transaction),
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
                stringify(transaction),
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
                stringify(transaction),
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
                stringify(transaction),
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
            window.ledger.signGasRewards(
                stringify(transaction),
                serializedPayload,
                path
            )
        );
    }

    signBakerStakeThreshold(
        transaction: UpdateInstruction<BakerStakeThreshold>,
        serializedPayload: Buffer,
        path: number[]
    ): Promise<Buffer> {
        return toBuffer(
            window.ledger.signBakerStakeThreshold(
                stringify(transaction),
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
                stringify(transaction),
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
                stringify(transaction),
                serializedPayload,
                path,
                INS
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
                stringify(transaction),
                serializedPayload,
                path,
                INS
            )
        );
    }
}
