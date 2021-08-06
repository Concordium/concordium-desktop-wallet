import React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { AttributeKey } from '@concordium/node-sdk';
import attributeNamesJson from '~/constants/attributeNames.json';
import { chosenAccountInfoSelector } from '~/features/AccountSlice';
import SidedRow from '~/components/SidedRow';
import styles from './Accounts.module.scss';
import {
    formatAttributeValue,
    compareAttributes,
} from '~/utils/identityHelpers';

const attributeNames: Record<string, string> = attributeNamesJson;

/**
 *  DIsplays the revealed Attributes of the chosen account.
 *  TODO: Use local credential to get attributes?
 */
export default function DisplayIdentityAttributes(): JSX.Element | null {
    const accountInfo = useSelector(chosenAccountInfoSelector);

    if (!accountInfo) {
        return null;
    }

    return (
        <>
            {Object.values(accountInfo.accountCredentials).map(
                (versionedCredential) => {
                    const credential = versionedCredential.value;

                    const attributes =
                        credential.contents.policy.revealedAttributes;
                    const attributeKeys = Object.keys(attributes);

                    const credId =
                        credential.type === 'normal'
                            ? credential.contents.credId
                            : credential.contents.regId;

                    if (attributeKeys.length === 0) {
                        return (
                            <h3
                                key={credId}
                                className={clsx(
                                    styles.identityAttributesOfCredential,
                                    'flex justifyCenter pB20'
                                )}
                            >
                                This credential has no revealed attributes!
                            </h3>
                        );
                    }

                    return (
                        <div
                            key={credId}
                            className={styles.identityAttributesOfCredential}
                        >
                            {attributeKeys
                                .map((k) => k as AttributeKey)
                                .sort(compareAttributes)
                                .map((attributeKey: AttributeKey) => (
                                    <SidedRow
                                        className={styles.identityAttribute}
                                        key={attributeKey}
                                        left={attributeNames[attributeKey]}
                                        right={formatAttributeValue(
                                            attributeKey,
                                            attributes[attributeKey]
                                        )}
                                    />
                                ))}
                        </div>
                    );
                }
            )}
        </>
    );
}
