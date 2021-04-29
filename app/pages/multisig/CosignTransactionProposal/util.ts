import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { findKey } from '~/utils/updates/AuthorizationHelper';
import { BlockSummary } from '~/utils/NodeApiTypes';
import {
    AccountTransaction,
    instanceOfLocalCredential,
    instanceOfDeployedCredential,
    UpdateInstruction,
    UpdateInstructionSignature,
} from '~/utils/types';
import {
    findAccountTransactionHandler,
    findUpdateInstructionHandler,
} from '~/utils/transactionHandlers/HandlerFinder';
import { getCredentialsOfAccount } from '~/database/CredentialDao';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';

export async function signUpdateInstruction(
    instruction: UpdateInstruction,
    ledger: ConcordiumLedgerClient,
    blockSummary: BlockSummary
): Promise<UpdateInstructionSignature[]> {
    const transactionHandler = findUpdateInstructionHandler(instruction.type);
    const authorizationKey = await findKey(
        ledger,
        blockSummary.updates.keys,
        instruction,
        transactionHandler
    );
    if (!authorizationKey) {
        throw new Error('Unable to get authorizationKey.');
    }

    const signatureBytes = await transactionHandler.signTransaction(
        instruction,
        ledger
    );

    return [
        {
            signature: signatureBytes.toString('hex'),
            authorizationKeyIndex: authorizationKey.index,
        },
    ];
}

export async function signAccountTransaction(
    transaction: AccountTransaction,
    ledger: ConcordiumLedgerClient
) {
    // TODO: Remove assumption that a credential only has 1 signature
    // We presently assume that there is only 1 key on a credential.
    const signatureIndex = 0;

    const credential = (await getCredentialsOfAccount(transaction.sender)).find(
        (cred) =>
            instanceOfLocalCredential(cred) &&
            instanceOfDeployedCredential(cred)
    );

    if (
        !credential ||
        !instanceOfLocalCredential(credential) ||
        !instanceOfDeployedCredential(credential)
    ) {
        throw new Error(
            'Unable to the sign the account transaction. You do not currently have a credential deployed on the associated account.'
        );
    }

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
