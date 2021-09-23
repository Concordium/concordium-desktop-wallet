import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    getGovernanceLevel1Path,
    getGovernanceLevel2Path,
    getGovernanceRootPath,
} from '../../features/ledger/Path';
import {
    Authorization,
    Authorizations,
    BlockSummary,
    Key,
    Keys,
    KeysWithThreshold,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isUpdateUsingLevel1Keys,
    isUpdateUsingRootKeys,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateInstructionSignature,
    UpdateInstructionSignatureWithIndex,
    UpdateType,
    VerifyKey,
} from '../types';

export interface AuthorizationKey {
    index: number;
    key: Key;
}

/**
 * Returns the key set that is used to sign the given update type.
 */
export function findKeySet(updateType: UpdateType, keys: Keys): VerifyKey[] {
    if (
        [
            UpdateType.UpdateRootKeys,
            UpdateType.UpdateLevel1KeysUsingRootKeys,
            UpdateType.UpdateLevel2KeysUsingRootKeys,
        ].includes(updateType)
    ) {
        return keys.rootKeys.keys;
    }
    if (
        [
            UpdateType.UpdateLevel1KeysUsingLevel1Keys,
            UpdateType.UpdateLevel2KeysUsingLevel1Keys,
        ].includes(updateType)
    ) {
        return keys.level1Keys.keys;
    }
    return keys.level2Keys.keys;
}

/**
 * Finds the authorization key for a given verification key. The authorization
 * key consists of the key and the authorization key index. If there
 * is no match, then undefined is returned.
 * @param keys the array of authorization keys from the block summary
 * @param verifyKey verification key to find the key with an index for
 */
function findAuthorizationKeyIndex(
    keys: Key[],
    authorization: Authorization,
    verifyKey: string
): AuthorizationKey | undefined {
    return keys
        .map((key, index) => {
            return { index, key };
        })
        .filter((key) => authorization.authorizedKeys.includes(key.index))
        .find((indexedKey) => {
            return indexedKey.key.verifyKey === verifyKey;
        });
}

function findHigherLevelKey(publicKey: string, keys: KeysWithThreshold) {
    return keys.keys
        .map((key, index) => {
            return { index, key };
        })
        .find((indexedKey) => {
            return indexedKey.key.verifyKey === publicKey;
        });
}

/**
 * Attempts to the find the level 2 authorization key for the connected Ledger. If the public-key is not authorized,
 * then undefined is returned. Note that the Authorizations key structure is the level 2 key set.
 */
function findAuthorizationKey(
    publicKey: string,
    transactionHandler: UpdateInstructionHandler<
        UpdateInstruction<UpdateInstructionPayload>,
        ConcordiumLedgerClient
    >,
    authorizations: Authorizations
) {
    const authorization = transactionHandler.getAuthorization(authorizations);

    const authorizationKey = findAuthorizationKeyIndex(
        authorizations.keys,
        authorization,
        publicKey
    );

    return authorizationKey;
}

/**
 * Attempts to find the key index of the given public key in the authorization.
 * If the public-key is not in the authorization on chain, then undefined will be returned.
 */
export function findKeyIndex(
    publicKey: string,
    keys: Keys,
    transaction: UpdateInstruction<UpdateInstructionPayload>,
    transactionHandler: UpdateInstructionHandler<
        UpdateInstruction<UpdateInstructionPayload>,
        ConcordiumLedgerClient
    >
): number | undefined {
    if (isUpdateUsingRootKeys(transaction)) {
        return findHigherLevelKey(publicKey, keys.rootKeys)?.index;
    }
    if (isUpdateUsingLevel1Keys(transaction)) {
        return findHigherLevelKey(publicKey, keys.level1Keys)?.index;
    }
    return findAuthorizationKey(publicKey, transactionHandler, keys.level2Keys)
        ?.index;
}

/**
 * Attaches the signature's key's index in the authorization to the signature.
 * If the key on the signature is not in the authorization, the function will throw an error.
 */
export async function attachKeyIndex(
    signature: UpdateInstructionSignature,
    blockSummary: BlockSummary,
    transaction: UpdateInstruction<UpdateInstructionPayload>,
    transactionHandler: UpdateInstructionHandler<
        UpdateInstruction<UpdateInstructionPayload>,
        ConcordiumLedgerClient
    >
): Promise<UpdateInstructionSignatureWithIndex> {
    const index = findKeyIndex(
        signature.authorizationPublicKey,
        blockSummary.updates.keys,
        transaction,
        transactionHandler
    );
    if (index === undefined) {
        throw new Error(
            'Public key associated with signature not found in authorized key list.'
        );
    }
    return { ...signature, authorizationKeyIndex: index };
}

/**
 * Attempts to find the authorized key, which is appropiate for the update, from the connected hardware wallet.
 *
 * The type of authorization key (root, level 1 or level 2) is derived directly from
 * the update type, as the type of key used to sign a given update is determined by its type.
 */
export async function getUpdateKey(
    ledger: ConcordiumLedgerClient,
    transaction: UpdateInstruction<UpdateInstructionPayload>
): Promise<string> {
    let publicKey;
    if (isUpdateUsingRootKeys(transaction)) {
        publicKey = await ledger.getPublicKeySilent(getGovernanceRootPath());
    } else if (isUpdateUsingLevel1Keys(transaction)) {
        publicKey = await ledger.getPublicKeySilent(getGovernanceLevel1Path());
    } else {
        publicKey = await ledger.getPublicKeySilent(getGovernanceLevel2Path());
    }
    return publicKey.toString('hex');
}
