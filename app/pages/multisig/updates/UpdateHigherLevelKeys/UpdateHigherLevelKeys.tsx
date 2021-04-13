import React, { useState } from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import { VerifyKey } from '~/utils/types';
import KeyUpdateEntry, { KeyUpdateEntryStatus } from './KeyUpdateEntry';

export default function UpdateHigherLevelKeys({ blockSummary }: UpdateProps) {
    const { keys } = blockSummary.updates.keys.rootKeys;
    const currentKeySetSize = keys.length;
    const [newKeys, setNewKeys] = useState<VerifyKey[]>(keys);

    // TODO Make this dynamic in the set of keys, i.e. it should depend on the key
    // set type being updates (root/level1).

    // TODO This is just a placeholder, remove it.
    if (!newKeys) {
        setNewKeys(keys);
    }

    return (
        <>
            <h5>Root governance key updates</h5>
            <p>
                Current size of root key set: <b>{currentKeySetSize}</b>
            </p>
            <p>
                New size of root key set: <b>{newKeys.length}</b>
            </p>
            <ul>
                {newKeys.map((key) => {
                    return (
                        <KeyUpdateEntry
                            key={key.verifyKey}
                            status={KeyUpdateEntryStatus.Unchanged}
                            verifyKey={key}
                        />
                    );
                })}
            </ul>
        </>
    );
}
