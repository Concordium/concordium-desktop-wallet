import { Authorization, Authorizations } from '../../../../node/NodeApiTypes';
import {
    AccessStructure,
    AccessStructureEnum,
    AuthorizationKeysUpdate,
    KeyIndexWithStatus,
    KeyUpdateEntryStatus,
} from '../../../../utils/types';

export function getCurrentThresholds(
    authorizations: Authorizations
): Map<AccessStructureEnum, number> {
    const currentThresholds = new Map<AccessStructureEnum, number>();
    currentThresholds.set(
        AccessStructureEnum.emergency,
        authorizations.emergency.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.protocol,
        authorizations.protocol.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.electionDifficulty,
        authorizations.electionDifficulty.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.euroPerEnergy,
        authorizations.euroPerEnergy.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.microGtuPerEuro,
        authorizations.microGTUPerEuro.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.foundationAccount,
        authorizations.foundationAccount.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.mintDistribution,
        authorizations.mintDistribution.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.gasRewards,
        authorizations.paramGASRewards.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.bakerStakeThreshold,
        authorizations.bakerStakeThreshold.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.addAnonymityRevoker,
        authorizations.addAnonymityRevoker.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.addIdentityProvider,
        authorizations.addIdentityProvider.threshold
    );
    return currentThresholds;
}

/**
 * Checks whether there are any references left to key with the provided index
 * in any access structure.
 */
export function keyIsInUse(
    keyIndex: number,
    accessStructures: AccessStructure[]
) {
    const result = accessStructures.find((accessStructure) => {
        const found = accessStructure.publicKeyIndicies.find(
            (publicKeyIndex) => publicKeyIndex.index === keyIndex
        );
        return found !== undefined;
    });
    if (result) {
        return true;
    }
    return false;
}

/**
 * Reduces the indices of all keys in all access structures that have a
 * current index higher than the provided index.
 */
function reduceIndicesByOne(
    accessStructures: AccessStructure[],
    index: number
): AccessStructure[] {
    const updatedAccessStructures: AccessStructure[] = accessStructures.map(
        (accessStructure) => {
            const updatedIndices = accessStructure.publicKeyIndicies.map(
                (publicKeyIndex) => {
                    if (publicKeyIndex.index > index) {
                        return {
                            ...publicKeyIndex,
                            index: publicKeyIndex.index - 1,
                        };
                    }
                    return publicKeyIndex;
                }
            );
            return {
                ...accessStructure,
                publicKeyIndicies: updatedIndices,
            };
        }
    );
    return updatedAccessStructures;
}

/**
 * Removes any indices marked as removed. If no indices point to a key anymore, then the
 * key is removed from the list of keys, as this means all its rights have been revoked,
 * and therefore it should be removed entirely.
 *
 * The algorithm goes as follows:
 *
 * - Naively remove indices marked as removed.
 * - For each key check if there is an index pointing to it
 *   - If there is, then just skip to next key.
 *   - If there is not, then remove the key and update all
 *     later indices to be (currentIndex - 1).
 */
export function removeRemovedKeys(
    payload: AuthorizationKeysUpdate
): AuthorizationKeysUpdate {
    const accessStructuresWithoutRemovedIndices = payload.accessStructures.map(
        (accessStructure) => {
            const updatedIndices = accessStructure.publicKeyIndicies.filter(
                (publicKeyIndex) =>
                    publicKeyIndex.status !== KeyUpdateEntryStatus.Removed
            );
            return { ...accessStructure, publicKeyIndicies: updatedIndices };
        }
    );

    let currentAccessStructures = accessStructuresWithoutRemovedIndices;
    const keysToRemove: number[] = [];

    for (let i = 0; i < payload.keys.length - keysToRemove.length; i += 1) {
        if (!keyIsInUse(i, currentAccessStructures)) {
            currentAccessStructures = reduceIndicesByOne(
                currentAccessStructures,
                i
            );
            keysToRemove.push(i + keysToRemove.length);

            if (i === payload.keys.length - 1) {
                break;
            } else {
                i = -1;
            }
        }
    }

    // Remove all the keys that are no longer referenced.
    const updatedKeys = payload.keys.filter(
        (_, index) => !keysToRemove.includes(index)
    );

    return {
        ...payload,
        keys: updatedKeys,
        accessStructures: currentAccessStructures,
    };
}

export function getAccessStructureTitle(
    accessStructureType: AccessStructureEnum
) {
    switch (accessStructureType) {
        case AccessStructureEnum.emergency:
            return 'Emergency';
        case AccessStructureEnum.protocol:
            return 'Protocol update';
        case AccessStructureEnum.electionDifficulty:
            return 'Election difficulty';
        case AccessStructureEnum.euroPerEnergy:
            return 'Euro per energy';
        case AccessStructureEnum.microGtuPerEuro:
            return 'Micro GTU per Euro';
        case AccessStructureEnum.foundationAccount:
            return 'Foundation account';
        case AccessStructureEnum.mintDistribution:
            return 'Mint distribution';
        case AccessStructureEnum.transactionFeeDistribution:
            return 'Transaction fee distribution';
        case AccessStructureEnum.gasRewards:
            return 'GAS rewards';
        case AccessStructureEnum.bakerStakeThreshold:
            return 'Baker stake threshold';
        case AccessStructureEnum.addAnonymityRevoker:
            return 'Add anonymity revoker';
        case AccessStructureEnum.addIdentityProvider:
            return 'Add identity provider';
        default:
            throw new Error(
                `Unknown access structure type: ${accessStructureType}`
            );
    }
}

function unchangedIndex(index: number): KeyIndexWithStatus {
    return {
        status: KeyUpdateEntryStatus.Unchanged,
        index,
    };
}

function mapAuthorizationToAccessStructure(
    authorization: Authorization,
    type: AccessStructureEnum
) {
    const accessStructure: AccessStructure = {
        publicKeyIndicies: authorization.authorizedKeys.map((index) =>
            unchangedIndex(index)
        ),
        threshold: authorization.threshold,
        type,
    };
    return accessStructure;
}

export function mapCurrentAuthorizationsToUpdate(
    authorizations: Authorizations
) {
    const accessStructures = [
        mapAuthorizationToAccessStructure(
            authorizations.emergency,
            AccessStructureEnum.emergency
        ),
        mapAuthorizationToAccessStructure(
            authorizations.protocol,
            AccessStructureEnum.protocol
        ),
        mapAuthorizationToAccessStructure(
            authorizations.electionDifficulty,
            AccessStructureEnum.electionDifficulty
        ),
        mapAuthorizationToAccessStructure(
            authorizations.euroPerEnergy,
            AccessStructureEnum.euroPerEnergy
        ),
        mapAuthorizationToAccessStructure(
            authorizations.microGTUPerEuro,
            AccessStructureEnum.microGtuPerEuro
        ),
        mapAuthorizationToAccessStructure(
            authorizations.foundationAccount,
            AccessStructureEnum.foundationAccount
        ),
        mapAuthorizationToAccessStructure(
            authorizations.mintDistribution,
            AccessStructureEnum.mintDistribution
        ),
        mapAuthorizationToAccessStructure(
            authorizations.transactionFeeDistribution,
            AccessStructureEnum.transactionFeeDistribution
        ),
        mapAuthorizationToAccessStructure(
            authorizations.paramGASRewards,
            AccessStructureEnum.gasRewards
        ),
        mapAuthorizationToAccessStructure(
            authorizations.bakerStakeThreshold,
            AccessStructureEnum.bakerStakeThreshold
        ),
        mapAuthorizationToAccessStructure(
            authorizations.addAnonymityRevoker,
            AccessStructureEnum.addAnonymityRevoker
        ),
        mapAuthorizationToAccessStructure(
            authorizations.addIdentityProvider,
            AccessStructureEnum.addIdentityProvider
        ),
    ];

    const update: AuthorizationKeysUpdate = {
        // TODO The key update type has to be dynamic here.
        keyUpdateType: 2,
        keys: authorizations.keys,
        accessStructures,
    };
    return update;
}
