import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    getGovernanceLevel2Path,
    getGovernanceRootPath,
} from '../../features/ledger/Path';
import { Authorization, Authorizations, Key, Keys } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import { UpdateInstruction, UpdateInstructionPayload } from '../types';

export interface AuthorizationKey {
    index: number;
    key: Key;
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

export async function findHigherLevelKey(
    ledger: ConcordiumLedgerClient,
    keys: Keys
) {
    // TODO It should be root key and leve 1 key, but my test network has the level 2 keys currently.
    const publicKey = (
        await ledger.getPublicKeySilent(getGovernanceRootPath())
    ).toString('hex');

    return keys.rootKeys.keys
        .map((key, index) => {
            return { index, key };
        })
        .find((indexedKey) => {
            return indexedKey.key.verifyKey === publicKey;
        });
}

/**
 * Attempts to the find the level 2 authorization key for the connected Ledger. If the public-key is not authorized,
 * then undefined is returned.
 */
export async function findAuthorizationKey(
    ledger: ConcordiumLedgerClient,
    transactionHandler: TransactionHandler<
        UpdateInstruction<UpdateInstructionPayload>,
        ConcordiumLedgerClient
    >,
    authorizations: Authorizations
) {
    const publicKey = await ledger.getPublicKeySilent(
        getGovernanceLevel2Path()
    );

    const authorization = transactionHandler.getAuthorization(authorizations);

    const authorizationKey = findAuthorizationKeyIndex(
        authorizations.keys,
        authorization,
        publicKey.toString('hex')
    );

    return authorizationKey;
}
