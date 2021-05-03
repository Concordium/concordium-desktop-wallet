import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    getGovernanceLevel1Path,
    getGovernanceLevel2Path,
    getGovernanceRootPath,
} from '../../features/ledger/Path';
import {
    Authorization,
    Authorizations,
    Key,
    Keys,
    KeysWithThreshold,
} from '../NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isUpdateUsingLevel1Keys,
    isUpdateUsingRootKeys,
    UpdateInstruction,
    UpdateInstructionPayload,
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
 * Attempts to find the authorized key for the connected hardware wallet. If the public-key
 * is not authorization on chain, then undefined will be returned.
 *
 * The type of authorization key (root, level 1 or level 2) is derived directly from
 * the update type, as the type of key used to sign a given update is determined by its type.
 */
export async function findKey(
    ledger: ConcordiumLedgerClient,
    keys: Keys,
    transaction: UpdateInstruction<UpdateInstructionPayload>,
    transactionHandler: UpdateInstructionHandler<
        UpdateInstruction<UpdateInstructionPayload>,
        ConcordiumLedgerClient
    >
): Promise<AuthorizationKey | undefined> {
    if (isUpdateUsingRootKeys(transaction)) {
        const publicKey = (
            await ledger.getPublicKeySilent(getGovernanceRootPath())
        ).toString('hex');
        return findHigherLevelKey(publicKey, keys.rootKeys);
    }

    if (isUpdateUsingLevel1Keys(transaction)) {
        const publicKey = (
            await ledger.getPublicKeySilent(getGovernanceLevel1Path())
        ).toString('hex');
        return findHigherLevelKey(publicKey, keys.level1Keys);
    }

    const publicKey = (
        await ledger.getPublicKeySilent(getGovernanceLevel2Path())
    ).toString('hex');
    return findAuthorizationKey(publicKey, transactionHandler, keys.level2Keys);
}
