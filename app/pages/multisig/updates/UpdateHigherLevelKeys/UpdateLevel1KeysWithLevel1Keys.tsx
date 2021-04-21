import React from 'react';
import { HigherLevelKeyUpdateProps } from '~/utils/transactionTypes';
import { UpdateType } from '~/utils/types';
import UpdateHigherLevelKeys from './UpdateHigherLevelKeys';

export default function UpdateLevel1KeysWithLevel1Keys({
    blockSummary,
    handleKeySubmit,
}: HigherLevelKeyUpdateProps): JSX.Element | null {
    if (!handleKeySubmit) {
        throw new Error('A key submission function must be supplied.');
    }

    return (
        <UpdateHigherLevelKeys
            blockSummary={blockSummary}
            type={UpdateType.UpdateLevel1KeysUsingLevel1Keys}
            handleKeySubmit={handleKeySubmit}
        />
    );
}
