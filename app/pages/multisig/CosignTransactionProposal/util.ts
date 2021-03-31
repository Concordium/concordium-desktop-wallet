import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import findAuthorizationKey from '~/utils/updates/AuthorizationHelper';
import { BlockSummary } from '~/utils/NodeApiTypes';
import {
    AccountTransaction,
    UpdateInstruction,
    UpdateInstructionSignature,
} from '~/utils/types';
import {
    findAccountTransactionHandler,
    findUpdateInstructionHandler,
} from '~/utils/updates/HandlerFinder';
import { getCredentialsOfAccount } from '~/database/CredentialDao';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';

export async function signUpdateInstruction(
    instruction: UpdateInstruction,
    ledger: ConcordiumLedgerClient,
    blockSummary: BlockSummary
): Promise<UpdateInstructionSignature> {
    const transactionHandler = await findUpdateInstructionHandler(
        instruction.type
    );
    const authorizationKey = await findAuthorizationKey(
        ledger,
        transactionHandler,
        blockSummary.updates.authorizations
    );
    if (!authorizationKey) {
        throw new Error('Unable to get authorizationKey.');
    }

    const signatureBytes = await transactionHandler.signTransaction(
        instruction,
        ledger
    );

    return {
        signature: signatureBytes.toString('hex'),
        authorizationKeyIndex: authorizationKey.index,
    };
}

export async function signAccountTransaction(
    transaction: AccountTransaction,
    ledger: ConcordiumLedgerClient
) {
    const signatureIndex = 0;

    const credential = (await getCredentialsOfAccount(transaction.sender)).find(
        (cred) =>
            // TODO: Use LocalCredential
            !(
                cred.identityId === undefined ||
                cred.credentialNumber === undefined ||
                cred.credentialIndex === undefined ||
                cred.credentialIndex === null
            )
    );

    if (
        !credential ||
        credential.credentialIndex === undefined ||
        credential.identityId === undefined ||
        credential.credentialNumber === undefined
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
