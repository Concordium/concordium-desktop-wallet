import React from 'react';
import Loading from '~/cross-app-components/Loading';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    UpdateType,
    VerifyKey,
} from '~/utils/types';
import withChainData, { ChainData } from '../../common/withChainData';
import { getAccessStructureTitle } from './util';

interface Props extends ChainData {
    authorizationKeysUpdate: AuthorizationKeysUpdate;
    type: UpdateType;
}

function findKeysForAccessStructure(
    accessStructure: AccessStructure,
    keys: VerifyKey[]
): VerifyKey[] {
    return keys
        .map((key, index) => {
            return { key, index };
        })
        .filter((result) =>
            accessStructure.publicKeyIndicies
                .map((idx) => idx.index)
                .includes(result.index)
        )
        .map((result) => result.key);
}

function accessStructureView(
    accessStructure: AccessStructure,
    keys: VerifyKey[]
) {
    const keysInStructure = findKeysForAccessStructure(accessStructure, keys);
    return (
        <div>
            <h2>{getAccessStructureTitle(accessStructure.type)}</h2>
            <p>Threshold: {accessStructure.threshold}</p>
            <ul>
                {keysInStructure.map((key) => {
                    return <li key={key.verifyKey}>{key.verifyKey}</li>;
                })}
            </ul>
        </div>
    );
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
            {type}
            {authorizationKeysUpdate.accessStructures.map((accessStructure) => {
                return accessStructureView(
                    accessStructure,
                    authorizationKeysUpdate.keys
                );
            })}
        </>
    );
}

export default withChainData(AuthorizationKeysView);
