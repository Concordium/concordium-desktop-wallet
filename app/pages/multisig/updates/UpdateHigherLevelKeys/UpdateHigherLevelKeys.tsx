import React, { useState } from 'react';
import { Key } from '~/utils/NodeApiTypes';
import { UpdateProps } from '~/utils/transactionTypes';

export default function UpdateHigherLevelKeys({ blockSummary }: UpdateProps) {
    const { keys } = blockSummary.updates.keys.rootKeys;
    const currentKeySetSize = keys.length;

    const [newKeys, setNewKeys] = useState<Key[]>(keys);
    // TODO Get current authorization keys

    // TODO Make this dynamic in the set of keys, i.e. it should depend on the key
    // set type being updates (root/level1).

    // TODO This is just a placeholder, remove it.
    if (!newKeys) {
        setNewKeys(keys);
    }

    return (
        <>
            <h4>Root governance key updates</h4>
            <p>Current size of root key set: {currentKeySetSize}</p>
            <p>New size of root key set: {newKeys.length}</p>
            <ul>
                {newKeys.map((key) => {
                    return <li key={key.verifyKey}>{key.verifyKey}</li>;
                })}
            </ul>
        </>
    );
}
