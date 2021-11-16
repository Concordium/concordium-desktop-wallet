import React from 'react';
import { AttributeKey } from '@concordium/node-sdk';
import attributeNamesJson from '~/constants/attributeNames.json';
import SidedRow from '~/components/SidedRow';
import { AttributeKeyName } from '~/utils/types';
import {
    formatAttributeValue,
    compareAttributes,
} from '~/utils/identityHelpers';

const attributeNames: Record<string, string> = attributeNamesJson;

interface Props {
    revealedAttributes: Record<AttributeKey, string>;
}

/**
 *  Displays the provided revealed attributes.
 */
export default function DisplayIdentityAttributes({
    revealedAttributes,
}: Props): JSX.Element | null {
    const attributeKeys = Object.keys(revealedAttributes);

    if (attributeKeys.length === 0) {
        return (
            <div className="pT10">
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
                        className="pT10"
                        key={attributeKey}
                        left={attributeNames[attributeKey]}
                        right={formatAttributeValue(
                            attributeKey,
                            revealedAttributes[attributeKey]
                        )}
                    />
                ))}
        </>
    );
}
