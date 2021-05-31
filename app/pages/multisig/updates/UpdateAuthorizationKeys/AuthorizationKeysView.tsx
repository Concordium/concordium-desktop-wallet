import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { AuthorizationKeysUpdate, UpdateType } from '~/utils/types';
import withChainData, { ChainData } from '../../common/withChainData';

interface Props extends ChainData {
    authorizationKeysUpdate: AuthorizationKeysUpdate;
    type: UpdateType;
}

/**
 * Displays an overview of an authorization keys update.
 */
function AuthorizationKeysView({
    authorizationKeysUpdate,
    type,
    blockSummary,
}: Props) {
    if (!blockSummary) {
        return <Loading inline />;
    }

    return (
        <>
            <div>
                Authorization key view placeholder!
                {type}
                {authorizationKeysUpdate}
            </div>
        </>
    );
}

export default withChainData(AuthorizationKeysView);
