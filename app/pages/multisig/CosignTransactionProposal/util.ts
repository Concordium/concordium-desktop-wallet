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
    // We assume that there is only 1 key on a credential. // TODO: Remove assumption that a credential only has 1 signature
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
            'Unable to sign transfer, because we were unable to find local and deployed credential'
        );
    }

    const path = {
        identityIndex: credential.identityId,
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
