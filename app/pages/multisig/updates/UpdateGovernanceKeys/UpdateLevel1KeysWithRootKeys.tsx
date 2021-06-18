import React from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import { UpdateType } from '~/utils/types';
import UpdateHigherLevelKeys from './UpdateHigherLevelKeys';

export default function UpdateLevel1KeysWithRootKeys({
    blockSummary,
    handleHigherLevelKeySubmit,
    defaults,
}: UpdateProps): JSX.Element | null {
    if (!handleHigherLevelKeySubmit) {
        throw new Error('A key submission function must be supplied.');
    }

    return (
        <UpdateHigherLevelKeys
            defaults={defaults}
            blockSummary={blockSummary}
            type={UpdateType.UpdateLevel1KeysUsingRootKeys}
            handleHigherLevelKeySubmit={handleHigherLevelKeySubmit}
        />
    );
}
