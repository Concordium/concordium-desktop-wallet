import React from 'react';
import Loading from '~/cross-app-components/Loading';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    KeyWithStatus,
    VerifyKey,
} from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import { generateStatusLabel } from './KeyUpdateEntry';
import { getAccessStructureTitle, removeRemovedKeys } from './util';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';
import Label from '~/components/Label';

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
            <Label className="mB5">
                {getAccessStructureTitle(accessStructure.type)}
            </Label>
            <div className="mono">Threshold: {accessStructure.threshold}</div>
            <ul>
                {keysInStructure.map((key) => {
                    return (
                        <li className={styles.listItem} key={key.key.verifyKey}>
                            {generateStatusLabel(key.status)}
                            <PublicKeyDetails
                                className={styles.keyText}
                                publicKey={key.key.verifyKey}
                            />
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
    chainParameters,
}: Props) {
    if (!chainParameters) {
        return <Loading inline />;
    }

    const authorizationKeysUpdateWithoutRemovedKeys = removeRemovedKeys(
        authorizationKeysUpdate
    );

    return (
        <>
            <div>
                <Label className="mB5">Level 2 keys and their indices</Label>
                <div className="mono">
                    New size of level 2 key set:{' '}
                    <b>
                        {authorizationKeysUpdateWithoutRemovedKeys.keys.length}
                    </b>
                </div>
                <ul>
                    {authorizationKeysUpdateWithoutRemovedKeys.keys.map(
                        (key, index) => {
                            return (
                                <li
                                    className={localStyles.listItem}
                                    key={key.verifyKey}
                                >
                                    <div className={localStyles.keyDiv}>
                                        <p className={localStyles.index}>
                                            {index}
                                        </p>
                                        <PublicKeyDetails
                                            className={localStyles.keyText}
                                            publicKey={key.verifyKey}
                                        />
                                    </div>
                                </li>
                            );
                        }
                    )}
                </ul>
            </div>
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
