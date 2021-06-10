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

async function HandleAccountTransactionSignatureFile(
    dispatch: Dispatch,
    transactionObject: AccountTransactionWithSignature,
    currentProposal: MultiSignatureTransaction
): Promise<ModalErrorInput | undefined> {
    const proposal: AccountTransactionWithSignature = parse(
        currentProposal.transaction
    );

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
            header: 'Duplicate Credential',
            content:
                'The loaded signature file contains a signature, from a credential, which already has a signature on the proposal.',
        };
    }

    // TODO: Remove assumption that a credential only has 1 signature
    const signatureIndex = 0;

    let accountInfo;
    try {
        accountInfo = await getAccountInfoOfAddress(transactionObject.sender);
    } catch (e) {
        return {
            show: true,
            header: 'Unable to reach node',
            content: 'Unable to verify signature without connection to node.',
        };
    }

    const verificationKey =
        accountInfo.accountCredentials[credentialIndex].value.contents
            .credentialPublicKeys.keys[signatureIndex];

    const validSignature = await ed.verify(
        signature[signatureIndex],
        await getTransactionSignDigest(proposal),
        verificationKey.verifyKey
    );

    // Prevent the user from adding a signature which is not valid on the proposal.
    if (!validSignature) {
        return {
            show: true,
            header: 'Incorrect Signature',
            content:
                'The loaded signature is not valid for the current transaction.',
        };
    }

    proposal.signatures[credentialIndex] = signature;

    const updatedProposal = {
        ...currentProposal,
        transaction: stringify(proposal),
    };

    updateCurrentProposal(dispatch, updatedProposal);
    return undefined;
}

/**
 * Returns whether or not the given signature is valid for the proposal. The signature is valid if
 * the verification key in the signature can verify the signature successfully on the hash
 * of the serialized transaction.
 */
async function isSignatureValid(
    proposal: UpdateInstruction,
    signature: UpdateInstructionSignature
): Promise<boolean> {
    const transactionSignatureDigest = await getTransactionSignDigest(proposal);
    return ed.verify(
        signature.signature,
        transactionSignatureDigest,
        signature.authorizationPublicKey
    );
}

async function HandleUpdateInstructionSignatureFile(
    dispatch: Dispatch,
    transactionObject: UpdateInstruction,
    currentProposal: MultiSignatureTransaction
): Promise<ModalErrorInput | undefined> {
    const proposal: UpdateInstruction = parse(currentProposal.transaction);

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

    let validSignature = false;
    validSignature = await isSignatureValid(proposal, signature);

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
    const updatedProposal = {
        ...currentProposal,
        transaction: stringify(proposal),
    };

    updateCurrentProposal(dispatch, updatedProposal);
    return undefined;
}

export async function HandleSignatureFile(
    dispatch: Dispatch,
    file: Buffer,
    currentProposal: MultiSignatureTransaction
): Promise<ModalErrorInput | undefined> {
    const invalidFile = {
        show: true,
        header: 'Invalid file',
        content:
            'The chosen file was invalid. A file containing a signed multi signature transaction proposal in JSON format was expected.',
    };

    let transactionObject;
    try {
        transactionObject = parse(file.toString('utf-8'));
    } catch (error) {
        return invalidFile;
    }

    if (instanceOfUpdateInstruction(transactionObject)) {
        return HandleUpdateInstructionSignatureFile(
            dispatch,
            transactionObject,
            currentProposal
        );
    }
    if (instanceOfAccountTransactionWithSignature(transactionObject)) {
        return HandleAccountTransactionSignatureFile(
            dispatch,
            transactionObject,
            currentProposal
        );
    }
    return invalidFile;
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
