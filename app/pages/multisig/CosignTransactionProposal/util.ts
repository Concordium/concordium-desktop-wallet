import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getUpdateKey } from '~/utils/updates/AuthorizationHelper';
import {
    AccountTransaction,
    CredentialWithIdentityNumber,
    DeployedCredential,
    UpdateInstruction,
    UpdateInstructionSignature,
} from '~/utils/types';
import {
    findAccountTransactionHandler,
    findUpdateInstructionHandler,
} from '~/utils/transactionHandlers/HandlerFinder';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';

export async function signUpdateInstruction(
    instruction: UpdateInstruction,
    ledger: ConcordiumLedgerClient
): Promise<UpdateInstructionSignature[]> {
    const transactionHandler = findUpdateInstructionHandler(instruction.type);
    const publicKey = await getUpdateKey(ledger, instruction);
    const signatureBytes = await transactionHandler.signTransaction(
        instruction,
        ledger
    );
    return [
        {
            signature: signatureBytes.toString('hex'),
            authorizationPublicKey: publicKey,
        },
    ];
}

export async function signAccountTransaction(
    transaction: AccountTransaction,
    ledger: ConcordiumLedgerClient,
    credential: CredentialWithIdentityNumber & DeployedCredential
) {
    // TODO: Remove assumption that a credential only has 1 signature
    // We presently assume that there is only 1 key on a credential. If support
    // for multiple signatures is added, then this has to be updated.
    const signatureIndex = 0;

    const path = {
        identityIndex: credential.identityNumber,
        accountIndex: credential.credentialNumber,
        signatureIndex,
    };

    const signatureBytes = await findAccountTransactionHandler(
        transaction.transactionKind
    ).signTransaction(transaction, ledger, path);

    const signatures = buildTransactionAccountSignature(
        credential.credentialIndex,
        signatureIndex,
        signatureBytes
    );

    return signatures;
}
