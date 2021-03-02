import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { Authorization, Authorizations, Key } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import { UpdateInstruction, UpdateInstructionPayload } from '../types';

/**
 * Finds the authorization key index for a given verification key. If there
 * is no match, then undefined is returned.
 * @param keys the array of authorization keys from the block summary
 * @param verifyKey verification key to find the index for
 */
function findAuthorizationKeyIndex(
    keys: Key[],
    authorization: Authorization,
    verifyKey: string
) {
    return keys
        .map((key, index) => {
            return { index, key };
        })
        .filter((key) => authorization.authorizedKeys.includes(key.index))
        .find((indexedKey) => {
            return indexedKey.key.verifyKey === verifyKey;
        });
}

/**
 * Attempts to the find the level 2 authorization key for the connected Ledger. If the public-key is not authorized,
 * then undefined is returned.
 */
export default async function findAuthorizationKey(
    ledger: ConcordiumLedgerClient,
    transactionHandler: TransactionHandler<
        UpdateInstruction<UpdateInstructionPayload>,
        ConcordiumLedgerClient
    >,
    authorizations: Authorizations
) {
    const publicKey = await ledger.getPublicKey(getGovernanceLevel2Path());

    const authorization = transactionHandler.getAuthorization(authorizations);

    const authorizationKey = findAuthorizationKeyIndex(
        authorizations.keys,
        authorization,
        publicKey.toString('hex')
    );

    return authorizationKey;
}
