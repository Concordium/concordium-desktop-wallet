import React from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import { UpdateType } from '~/utils/types';
import UpdateAuthorizationKeys from './UpdateAuthorizationKeys';

export default function UpdateLevel2KeysWithRootKeys({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    return (
        <UpdateAuthorizationKeys
            blockSummary={blockSummary}
            type={UpdateType.UpdateLevel1KeysUsingRootKeys}
        />
    );
}
