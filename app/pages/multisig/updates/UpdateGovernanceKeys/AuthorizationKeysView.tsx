import React from 'react';
import Loading from '~/cross-app-components/Loading';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    KeyWithStatus,
    VerifyKey,
} from '~/utils/types';
import withChainData, { ChainData } from '../../common/withChainData';
import { generateStatusLabel } from './KeyUpdateEntry';
import { getAccessStructureTitle, removeRemovedKeys } from './util';
import styles from './HigherLevelKeysView.module.scss';
import localStyles from './UpdateAuthorizationKeys.module.scss';

interface Props extends ChainData {
    authorizationKeysUpdate: AuthorizationKeysUpdate;
}

function findKeysForAccessStructure(
    accessStructure: AccessStructure,
    keys: VerifyKey[]
): KeyWithStatus[] {
    return keys
        .map((key, index) => {
            return { key, index };
        })
        .filter((result) =>
            accessStructure.publicKeyIndicies
                .map((idx) => idx.index)
                .includes(result.index)
        )
        .map((result) => {
            const matchingIndex = accessStructure.publicKeyIndicies.find(
                (idx) => idx.index === result.index
            );
            if (!matchingIndex) {
                throw new Error(
                    'This should not happen as the filter above ensures that a value will be found.'
                );
            }
            return {
                key: result.key,
                status: matchingIndex.status,
            };
        });
}

function accessStructureView(
    accessStructure: AccessStructure,
    keys: VerifyKey[]
) {
    const keysInStructure = findKeysForAccessStructure(accessStructure, keys);
    return (
        <div key={accessStructure.type}>
            <h2>{getAccessStructureTitle(accessStructure.type)}</h2>
            <p>Threshold: {accessStructure.threshold}</p>
            <ul>
                {keysInStructure.map((key) => {
                    return (
                        <li className={styles.listItem} key={key.key.verifyKey}>
                            {generateStatusLabel(key.status)}
                            <p className={styles.keyText}>
                                {key.key.verifyKey}
                            </p>
                        </li>
                    );
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
    blockSummary,
}: Props) {
    if (!blockSummary) {
        return <Loading inline />;
    }

    const authorizationKeysUpdateWithoutRemovedKeys = removeRemovedKeys(
        authorizationKeysUpdate
    );

    return (
        <>
            <h2>Level 2 keys and their indices</h2>
            <p>
                New size of level 2 key set:{' '}
                <b>{authorizationKeysUpdateWithoutRemovedKeys.keys.length}</b>
            </p>
            <ul>
                {authorizationKeysUpdateWithoutRemovedKeys.keys.map(
                    (key, index) => {
                        return (
                            <li
                                className={localStyles.listItem}
                                key={key.verifyKey}
                            >
                                <div className="flex alignCenter">
                                    <p className={localStyles.index}>{index}</p>
                                    <p className={localStyles.keyText}>
                                        {key.verifyKey}
                                    </p>
                                </div>
                            </li>
                        );
                    }
                )}
            </ul>
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
