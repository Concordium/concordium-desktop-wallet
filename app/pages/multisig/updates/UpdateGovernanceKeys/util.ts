import { isAuthorizationsV1 } from '@concordium/web-sdk';
import { Authorization, Authorizations } from '../../../../node/NodeApiTypes';
import {
    AccessStructure,
    AccessStructureEnum,
    AuthorizationKeysUpdate,
    AuthorizationKeysUpdateType,
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
        AccessStructureEnum.consensus,
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
        AccessStructureEnum.transactionFeeDistribution,
        authorizations.transactionFeeDistribution.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.gasRewards,
        authorizations.paramGASRewards.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.poolParameters,
        authorizations.poolParameters.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.addAnonymityRevoker,
        authorizations.addAnonymityRevoker.threshold
    );
    currentThresholds.set(
        AccessStructureEnum.addIdentityProvider,
        authorizations.addIdentityProvider.threshold
    );
    if (isAuthorizationsV1(authorizations)) {
        currentThresholds.set(
            AccessStructureEnum.cooldownParameters,
            authorizations.cooldownParameters.threshold
        );
        currentThresholds.set(
            AccessStructureEnum.timeParameters,
            authorizations.timeParameters.threshold
        );
    }
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
export function reduceIndicesByOne(
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
 * - Remove all keys that no longer have a reference to it.
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
        case AccessStructureEnum.consensus:
            return 'Consensus';
        case AccessStructureEnum.euroPerEnergy:
            return 'Euro per energy';
        case AccessStructureEnum.microGtuPerEuro:
            return 'Micro CCD per euro';
        case AccessStructureEnum.foundationAccount:
            return 'Foundation account';
        case AccessStructureEnum.mintDistribution:
            return 'Mint distribution';
        case AccessStructureEnum.transactionFeeDistribution:
            return 'Transaction fee distribution';
        case AccessStructureEnum.gasRewards:
            return 'GAS rewards';
        case AccessStructureEnum.poolParameters:
            return 'Pool parameters';
        case AccessStructureEnum.addAnonymityRevoker:
            return 'Add identity disclosure authority';
        case AccessStructureEnum.addIdentityProvider:
            return 'Add identity provider';
        case AccessStructureEnum.cooldownParameters:
            return 'Cooldown parameters';
        case AccessStructureEnum.timeParameters:
            return 'Time parameters';
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
    type: AuthorizationKeysUpdateType,
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
        // The election difficulty authorization is used for the new consensus updates
        mapAuthorizationToAccessStructure(
            authorizations.electionDifficulty,
            AccessStructureEnum.consensus
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
            authorizations.poolParameters,
            AccessStructureEnum.poolParameters
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

    if (isAuthorizationsV1(authorizations)) {
        accessStructures.push(
            mapAuthorizationToAccessStructure(
                authorizations.cooldownParameters,
                AccessStructureEnum.cooldownParameters
            )
        );
        accessStructures.push(
            mapAuthorizationToAccessStructure(
                authorizations.timeParameters,
                AccessStructureEnum.timeParameters
            )
        );
    }

    const update: AuthorizationKeysUpdate = {
        keyUpdateType: type,
        keys: authorizations.keys,
        accessStructures,
    };
    return update;
}
