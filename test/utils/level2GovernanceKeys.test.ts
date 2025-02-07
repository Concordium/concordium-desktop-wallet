import { VerifyKey } from '@concordium/web-sdk';
import {
    AccessStructure,
    AccessStructureEnum,
    AuthorizationKeysUpdate,
    KeyIndexWithStatus,
    KeyUpdateEntryStatus,
} from '../../app/utils/types';
import { removeRemovedKeys } from '../../app/pages/multisig/updates/UpdateGovernanceKeys/util';

const verifyKey: VerifyKey = {
    schemeId: 'Ed25519',
    verifyKey:
        'f17de4f54bc043e8d9399b9fdc3b22f868e2675861fa1784ebf85c4ae7ecdf86',
};
const verifyKeyUnchanged1: VerifyKey = {
    schemeId: 'Ed25519',
    verifyKey:
        '05492baed27a6707e81a34d18c170399d85787893749fd153f04382ef9dd2c42',
};
const verifyKeyUnchanged2: VerifyKey = {
    schemeId: 'Ed25519',
    verifyKey:
        '93291ed291a4130eb27208c1dcecbf812047bac686092e6b6372e2e86c7a7b5b',
};
const verifyKeyUnchanged3: VerifyKey = {
    schemeId: 'Ed25519',
    verifyKey:
        '513d1c4d60fe3adca4a5eefaa9674670b3cadd63e4ebd9e24d944c29fae205d5',
};

function createAccessStructure(indices: KeyIndexWithStatus[]) {
    const accessStructure: AccessStructure = {
        threshold: 1,
        type: AccessStructureEnum.foundationAccount,
        publicKeyIndicies: indices,
    };
    return accessStructure;
}

function createKeyIndicesWithStatus(amount: number, offset = 0) {
    const keys: KeyIndexWithStatus[] = [];
    for (let i = offset; i < amount + offset; i += 1) {
        keys.push({
            index: i,
            status: KeyUpdateEntryStatus.Removed,
        });
    }
    return keys;
}

test('Access structure with only one removed index, should have empty keys', () => {
    const removedIndex: KeyIndexWithStatus = {
        index: 0,
        status: KeyUpdateEntryStatus.Removed,
    };
    const authorizationKeysUpdate: AuthorizationKeysUpdate = {
        keys: [verifyKey],
        keyUpdateType: 2,
        accessStructures: [createAccessStructure([removedIndex])],
    };

    const result: AuthorizationKeysUpdate = removeRemovedKeys(
        authorizationKeysUpdate
    );
    expect(result.keys.length).toEqual(0);
});

/**
 * Keys: [0 1 2 3 4 5]
 * Access structure: [Removed Removed Removed Removed Removed Unchanged]
 *
 * Expected result:
 *  Keys: [5]
 */
test('An unchanged index key is not removed', () => {
    const removedIndices = createKeyIndicesWithStatus(5);
    const unchangedIndex = { index: 5, status: KeyUpdateEntryStatus.Unchanged };
    const authorizationKeysUpdate: AuthorizationKeysUpdate = {
        keys: [
            verifyKey,
            verifyKey,
            verifyKey,
            verifyKey,
            verifyKey,
            verifyKeyUnchanged1,
        ],
        keyUpdateType: 2,
        accessStructures: [
            createAccessStructure(removedIndices.concat(unchangedIndex)),
        ],
    };

    const result: AuthorizationKeysUpdate = removeRemovedKeys(
        authorizationKeysUpdate
    );
    expect(result.keys.length).toEqual(1);
    expect(result.keys[0]).toEqual(verifyKeyUnchanged1);
    expect(result.accessStructures[0].publicKeyIndicies[0].index).toEqual(0);
});

/**
 * Keys: [0 1 2 3 4 5]
 * Access structure: [Removed Removed Unchanged1 Removed Removed Unchanged2]
 *
 * Expected result:
 *  Keys: [2, 5]
 */
test('Unchanged indices are not removed', () => {
    const removedIndices1 = createKeyIndicesWithStatus(2);
    const unchangedIndex1 = {
        index: 2,
        status: KeyUpdateEntryStatus.Unchanged,
    };
    const removedIndices2 = createKeyIndicesWithStatus(2, 3);
    const unchangedIndex2 = {
        index: 5,
        status: KeyUpdateEntryStatus.Unchanged,
    };
    const authorizationKeysUpdate: AuthorizationKeysUpdate = {
        keys: [
            verifyKey,
            verifyKey,
            verifyKeyUnchanged1,
            verifyKey,
            verifyKey,
            verifyKeyUnchanged2,
        ],
        keyUpdateType: 2,
        accessStructures: [
            createAccessStructure(
                removedIndices1
                    .concat(unchangedIndex1)
                    .concat(removedIndices2)
                    .concat(unchangedIndex2)
            ),
        ],
    };

    const result: AuthorizationKeysUpdate = removeRemovedKeys(
        authorizationKeysUpdate
    );
    expect(result.keys.length).toEqual(2);
    expect(result.keys[0]).toEqual(verifyKeyUnchanged1);
    expect(result.accessStructures[0].publicKeyIndicies[0].index).toEqual(0);
    expect(result.keys[1]).toEqual(verifyKeyUnchanged2);
    expect(result.accessStructures[0].publicKeyIndicies[1].index).toEqual(1);
});

/**
 * Keys: [0 1 2 3 4 5]
 * Access structure: [Removed Removed Unchanged1 Removed Removed Unchanged2]
 * Access structure: [Unchanged1 Removed Removed Removed Removed Unchanged2]
 *
 * Expected result:
 *  Keys: [0, 2, 5]
 *  Access structure: [1, 2]
 *  Access structure: [0, 2]
 */
test('Unchanged indices across multiple access structures are not removed', () => {
    const removedIndices1 = createKeyIndicesWithStatus(2);
    const unchangedIndex1 = {
        index: 2,
        status: KeyUpdateEntryStatus.Unchanged,
    };
    const removedIndices2 = createKeyIndicesWithStatus(2, 3);
    const unchangedIndex2 = {
        index: 5,
        status: KeyUpdateEntryStatus.Unchanged,
    };
    const firstAccessStructure = createAccessStructure(
        removedIndices1
            .concat(unchangedIndex1)
            .concat(removedIndices2)
            .concat(unchangedIndex2)
    );

    const removedIndicesSecond = createKeyIndicesWithStatus(4, 1);
    const unchangedIndex1Second = {
        index: 0,
        status: KeyUpdateEntryStatus.Unchanged,
    };
    const unchangedIndex2Second = {
        index: 5,
        status: KeyUpdateEntryStatus.Unchanged,
    };
    const secondAccessStructure = createAccessStructure(
        [unchangedIndex1Second]
            .concat(removedIndicesSecond)
            .concat(unchangedIndex2Second)
    );

    const authorizationKeysUpdate: AuthorizationKeysUpdate = {
        keys: [
            verifyKeyUnchanged3,
            verifyKey,
            verifyKeyUnchanged1,
            verifyKey,
            verifyKey,
            verifyKeyUnchanged2,
        ],
        keyUpdateType: 2,
        accessStructures: [firstAccessStructure, secondAccessStructure],
    };

    const result: AuthorizationKeysUpdate = removeRemovedKeys(
        authorizationKeysUpdate
    );
    expect(result.keys.length).toEqual(3);
    expect(result.keys[0]).toEqual(verifyKeyUnchanged3);
    expect(result.keys[1]).toEqual(verifyKeyUnchanged1);
    expect(result.keys[2]).toEqual(verifyKeyUnchanged2);

    expect(result.accessStructures[0].publicKeyIndicies[0].index).toEqual(1);
    expect(result.accessStructures[0].publicKeyIndicies[1].index).toEqual(2);

    expect(result.accessStructures[1].publicKeyIndicies[0].index).toEqual(0);
    expect(result.accessStructures[1].publicKeyIndicies[1].index).toEqual(2);
});
