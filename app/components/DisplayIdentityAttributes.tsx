import React from 'react';
import { AttributeKey } from '@concordium/node-sdk';
import attributeNamesJson from '~/constants/attributeNames.json';
import SidedRow from '~/components/SidedRow';
import { AttributeKeyName, ClassName } from '~/utils/types';
import {
    formatAttributeValue,
    compareAttributes,
} from '~/utils/identityHelpers';

const attributeNames: Record<string, string> = attributeNamesJson;

interface Props extends ClassName {
    attributes: Record<AttributeKey | string, string>;
}

/**
 *  Displays the provided attributes.
 */
export default function DisplayIdentityAttributes({
    attributes,
    className,
}: Props): JSX.Element | null {
    const attributeKeys = Object.keys(attributes);

    if (attributeKeys.length === 0) {
        return (
            <div className={className}>
                This credential has no identity data revealed
            </div>
        );
    }
    return (
        <>
            {attributeKeys
                .map((k) => k as AttributeKeyName)
                .sort(compareAttributes)
                .map((attributeKey: AttributeKeyName) => (
                    <SidedRow
                        className={className}
                        key={attributeKey}
                        left={attributeNames[attributeKey] || attributeKey}
                        right={formatAttributeValue(
                            attributeKey,
                            attributes[attributeKey]
                        )}
                    />
                ))}
        </>
    );
}
