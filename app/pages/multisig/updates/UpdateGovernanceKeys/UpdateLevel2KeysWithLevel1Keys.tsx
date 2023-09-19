import React from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import { UpdateType } from '~/utils/types';
import UpdateAuthorizationKeys from './UpdateAuthorizationKeys';

export default function UpdateLevel2KeysWithLevel1Keys({
    chainParameters,
    consensusStatus,
    handleAuthorizationKeySubmit,
    defaults,
}: UpdateProps): JSX.Element | null {
    if (!handleAuthorizationKeySubmit) {
        throw new Error('A key submission function has to be provided.');
    }

    return (
        <UpdateAuthorizationKeys
            defaults={defaults}
            chainParameters={chainParameters}
            consensusStatus={consensusStatus}
            type={UpdateType.UpdateLevel2KeysUsingLevel1Keys}
            handleKeySubmit={handleAuthorizationKeySubmit}
        />
    );
}
