import * as ed from 'noble-ed25519';
import {
    Transaction,
    instanceOfAccountTransactionWithSignature,
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    UpdateInstructionSignature,
    TransactionCredentialSignature,
    AccountTransactionWithSignature,
    UpdateInstruction,
    Dispatch,
} from '~/utils/types';
import { parse, stringify } from '~/utils/JSONHelper';
import { ModalErrorInput } from '~/components/SimpleErrorModal';
import { updateCurrentProposal } from '~/features/MultiSignatureSlice';
import getTransactionSignDigest from '~/utils/transactionHash';
import { getAccountInfoOfAddress } from '~/node/nodeHelpers';
import { findKeyIndex } from '~/utils/updates/AuthorizationHelper';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import errorMessages from '~/constants/errorMessages.json';
import { getBlockChainParameters } from '~/node/nodeRequests';

/**
 * @param transactionObject, transaction object, which contains a signature, which is to be added to the current proposal
 * @param proposal, transaction object, from the current proposal. If the incoming signature is valid, it will be added.
 * @returns either a ModalErrorInput, which describes why the signature was not added, or the updatedProposal transaction, in case the signature was added
 */
async function HandleAccountTransactionSignatureFile(
    transactionObject: AccountTransactionWithSignature,
    proposal: AccountTransactionWithSignature
): Promise<ModalErrorInput | AccountTransactionWithSignature> {
    const credentialIndexList = Object.keys(transactionObject.signatures);
    // We currently restrict the amount of credential signatures imported at the same time to be 1, as it
    // simplifies error handling and currently it is only possible to export a file signed once.
    // This can be expanded to support multiple signatures at a later point in time if need be.
    if (credentialIndexList.length !== 1) {
        return {
            show: true,
            header: 'Invalid signature file',
            content:
                'The loaded signature file does not contain exactly one credential signature. Multiple signatures or zero signatures are not valid input.',
        };
    }

    const credentialIndex = parseInt(credentialIndexList[0], 10);
    const signature = transactionObject.signatures[credentialIndex];

    // Prevent the user from adding a signature from a credential that is already present on the proposal.
    if (proposal.signatures[credentialIndex] !== undefined) {
        return {
            show: true,
            header: 'Duplicate credential',
            content:
                'The loaded signature file contains a signature, from a credential, which already has a signature on the proposal.',
        };
    }

    // TODO: Remove assumption that a credential only has 1 signature
    const signatureIndex = 0;

    let accountInfo;
    try {
        accountInfo = await getAccountInfoOfAddress(proposal.sender);
    } catch (e) {
        return {
            show: true,
            header: errorMessages.unableToReachNode,
            content:
                'Unable to verify the signature without a connection to a node.',
        };
    }

    const verificationKey =
        accountInfo.accountCredentials[credentialIndex].value.contents
            .credentialPublicKeys.keys[signatureIndex];

    const validSignature = await ed.verify(
        signature[signatureIndex],
        getTransactionSignDigest(proposal),
        verificationKey.verifyKey
    );

    // Prevent the user from adding a signature which is not valid on the proposal.
    if (!validSignature) {
        return {
            show: true,
            header: 'Incorrect signature',
            content:
                'The loaded signature is not valid for the current transaction.',
        };
    }

    proposal.signatures[credentialIndex] = signature;

    return proposal;
}

/**
 * Returns whether or not the given signature is valid for the proposal. The signature is valid if
 * the verification key in the signature can verify the signature successfully on the hash
 * of the serialized transaction.
 */
export async function isSignatureValid(
    proposal: UpdateInstruction,
    signature: UpdateInstructionSignature
): Promise<boolean> {
    const transactionSignatureDigest = getTransactionSignDigest(proposal);
    return ed.verify(
        signature.signature,
        transactionSignatureDigest,
        signature.authorizationPublicKey
    );
}

/**
 * @param transactionObject, transaction object, which contains a signature, which is to be added to the current proposal
 * @param proposal, transaction object, from the current proposal. If the incoming signature is valid, it will be added.
 * @returns either a ModalErrorInput, which describes why the signature was not added, or the updatedProposal transaction, in case the signature was added
 */
async function HandleUpdateInstructionSignatureFile(
    transactionObject: UpdateInstruction,
    proposal: UpdateInstruction
): Promise<ModalErrorInput | UpdateInstruction> {
    // We currently restrict the amount of signatures imported at the same time to be 1, as it
    // simplifies error handling and currently it is only possible to export a file signed once.
    // This can be expanded to support multiple signatures at a later point in time if need be.
    if (transactionObject.signatures.length !== 1) {
        return {
            show: true,
            header: 'Invalid signature file',
            content:
                'The loaded signature file does not contain exactly one signature. Multiple signatures or zero signatures are not valid input.',
        };
    }

    const signature = transactionObject.signatures[0];

    // Prevent the user from adding a signature that is already present on the proposal.
    if (
        proposal.signatures
            .map((sig) => sig.signature)
            .includes(signature.signature)
    ) {
        return {
            show: true,
            header: 'Duplicate signature',
            content:
                'The loaded signature file contains a signature that is already present on the proposal.',
        };
    }

    let keys;
    try {
        keys = await getBlockChainParameters();
    } catch {
        return {
            show: true,
            header: errorMessages.unableToReachNode,
            content:
                'Unable to verify that the signature is signed by an authorized key without a connection to a node.',
        };
    }
    const handler = findUpdateInstructionHandler(proposal.type);
    const keyIndex = findKeyIndex(
        signature.authorizationPublicKey,
        keys,
        proposal,
        handler
    );
    if (keyIndex === undefined) {
        return {
            show: true,
            header: 'Unathorized signature',
            content:
                'The loaded signature file contains a signature signed by an unauthorized key.',
        };
    }

    const validSignature = await isSignatureValid(proposal, signature);

    // Prevent the user from adding an invalid signature.
    if (!validSignature) {
        return {
            show: true,
            header: 'Invalid signature',
            content:
                'The loaded signature file contains a signature that is either not for this proposal, or was signed by an unauthorized key.',
        };
    }

    proposal.signatures = proposal.signatures.concat(
        transactionObject.signatures
    );

    return proposal;
}

export async function HandleSignatureFiles(
    dispatch: Dispatch,
    files: Buffer[],
    currentProposal: MultiSignatureTransaction
): Promise<ModalErrorInput | undefined> {
    const invalidFile = {
        show: true,
        header: 'Invalid file',
        content:
            'The chosen file was invalid. A file containing a signed multi signature transaction proposal in JSON format was expected.',
    };

    let transaction = parse(currentProposal.transaction);
    let signatureFileHandler;

    if (instanceOfUpdateInstruction(transaction)) {
        signatureFileHandler = HandleUpdateInstructionSignatureFile;
    } else if (instanceOfAccountTransactionWithSignature(transaction)) {
        signatureFileHandler = HandleAccountTransactionSignatureFile;
    } else {
        throw new Error('currentProposal is an unknown transaction type');
    }

    for (const file of files) {
        let transactionInFile;
        try {
            transactionInFile = parse(file.toString('utf-8'));
        } catch (error) {
            return invalidFile;
        }
        if (!transactionInFile?.signatures) {
            return invalidFile;
        }

        try {
            const result = await signatureFileHandler(
                transactionInFile,
                transaction
            );
            if ('show' in result) {
                return result;
            }
            transaction = result;
        } catch (e) {
            return {
                show: true,
                header: 'Unable to load signature',
                content: `We were unable to load a given signature due to: ${
                    (e as Error).message
                }`,
            };
        }
    }

    const updatedProposal = {
        ...currentProposal,
        transaction: stringify(transaction),
    };

    updateCurrentProposal(dispatch, updatedProposal);
    return undefined;
}

export function getSignatures(
    transaction: Transaction
): TransactionCredentialSignature[] | UpdateInstructionSignature[] {
    if (instanceOfUpdateInstruction(transaction)) {
        return transaction.signatures;
    }
    if (instanceOfAccountTransactionWithSignature(transaction)) {
        return Object.values(transaction.signatures);
    }
    throw new Error(
        'invalid input: Only UpdateInstruction and AccountTransactionsWithSignature has signatures'
    );
}
